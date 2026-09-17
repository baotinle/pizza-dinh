import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { computePayrollForEmployee, hoursBetween } from "@/lib/payroll";
import { formatDateVn, formatTimeVn, toIsoDate } from "@/lib/date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_BADGE_CLASS, type Attendance, type PayrollAdjustment } from "@/lib/types/domain";
import { TimesheetFilterForm } from "./timesheet-filter-form";

// Pay period runs the 6th of one month through the 5th of the next, per the shop's payroll cycle.
function currentPayPeriodRange() {
  const today = new Date();
  const periodStartMonth = today.getDate() >= 6 ? today.getMonth() : today.getMonth() - 1;
  const from = new Date(today.getFullYear(), periodStartMonth, 6);
  const to = new Date(today.getFullYear(), periodStartMonth + 1, 5);
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

export default async function TimesheetPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const params = await searchParams;
  const defaults = currentPayPeriodRange();
  const from = params.from || defaults.from;
  const to = params.to || defaults.to;

  const [{ data: attendanceData }, { data: adjustmentsData }] = await Promise.all([
    supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", profile.id)
      .gte("work_date", from)
      .lte("work_date", to)
      .order("work_date", { ascending: false }),
    supabase
      .from("payroll_adjustments")
      .select("*")
      .eq("employee_id", profile.id)
      .gte("period_start", from)
      .lte("period_end", to),
  ]);

  const rows = (attendanceData ?? []) as Attendance[];
  const adjustments = (adjustmentsData ?? []) as PayrollAdjustment[];

  const summary = computePayrollForEmployee(
    profile,
    rows,
    adjustments,
    new Date(from),
    new Date(to),
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Bảng công của tôi</h1>
        <p className="text-sm text-muted-foreground">
          Kỳ lương từ {formatDateVn(from)} đến {formatDateVn(to)}
        </p>
      </div>

      <TimesheetFilterForm defaultFrom={from} defaultTo={to} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tổng giờ làm</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {rows.reduce((s, r) => s + hoursBetween(r.check_in_time, r.check_out_time), 0).toFixed(1)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Số ca làm</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.totalShifts}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Giờ OT</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.totalOtHours}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ước tính thu nhập</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {summary.totalIncome.toLocaleString("vi-VN")} đ
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Giờ vào</TableHead>
              <TableHead>Giờ ra</TableHead>
              <TableHead>OT</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{formatDateVn(row.work_date)}</TableCell>
                <TableCell>
                  <Badge className={ATTENDANCE_STATUS_BADGE_CLASS[row.status]}>
                    {ATTENDANCE_STATUS_LABELS[row.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {row.check_in_time ? formatTimeVn(row.check_in_time) : "-"}
                </TableCell>
                <TableCell>
                  {row.check_out_time ? formatTimeVn(row.check_out_time) : "-"}
                </TableCell>
                <TableCell>{row.ot_hours}</TableCell>
                <TableCell>{row.note ?? "-"}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Chưa có dữ liệu chấm công trong tháng này.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
