import { createClient } from "@/lib/supabase/server";
import { hoursBetween } from "@/lib/payroll";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateVn, formatTimeVn, todayIsoVn, toIsoDate } from "@/lib/date";
import { ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_BADGE_CLASS, type Attendance, type Profile } from "@/lib/types/domain";
import { AttendanceFilterForm } from "./attendance-filter-form";
import { AttendanceRecordDialog } from "./attendance-record-dialog";
import { StatCard } from "./stat-card";

function defaultRange() {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    from: toIsoDate(from),
    to: todayIsoVn(),
  };
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; employee?: string }>;
}) {
  const params = await searchParams;
  const defaults = defaultRange();
  const from = params.from || defaults.from;
  const to = params.to || defaults.to;
  const employeeFilter = params.employee || "all";

  const supabase = await createClient();

  const { data: employeesData } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "employee")
    .order("full_name");
  const employees = (employeesData ?? []) as Profile[];
  const employeeMap = new Map(employees.map((e) => [e.id, e.full_name]));

  let query = supabase
    .from("attendance")
    .select("*")
    .gte("work_date", from)
    .lte("work_date", to)
    .order("work_date", { ascending: false });

  if (employeeFilter !== "all") {
    query = query.eq("employee_id", employeeFilter);
  } else {
    query = query.in("employee_id", employees.map((e) => e.id));
  }

  const { data } = await query;
  const rows = (data ?? []) as Attendance[];

  const totalShifts = rows.filter((r) => r.status === "on_time" || r.status === "late").length;
  const totalHours = rows.reduce((sum, r) => sum + hoursBetween(r.check_in_time, r.check_out_time), 0);
  const lateAbsentCount = rows.filter((r) => r.status === "late" || r.status === "absent").length;
  const totalOt = rows.reduce((sum, r) => sum + Number(r.ot_hours ?? 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bảng chấm công & Quản lý ca</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi và điểm danh chi tiết cho từng nhân viên.
          </p>
        </div>
        <AttendanceRecordDialog employees={employees} triggerLabel="+ Thêm bản ghi" />
      </div>

      <AttendanceFilterForm
        employees={employees}
        defaultFrom={from}
        defaultTo={to}
        defaultEmployeeId={employeeFilter}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tổng số ca làm" value={totalShifts} />
        <StatCard label="Tổng số giờ làm" value={totalHours.toFixed(1)} />
        <StatCard label="Đi muộn / Vắng mặt" value={lateAbsentCount} />
        <StatCard label="Tổng giờ OT" value={totalOt.toFixed(1)} />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Giờ vào</TableHead>
              <TableHead>Giờ ra</TableHead>
              <TableHead>OT</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{formatDateVn(row.work_date)}</TableCell>
                <TableCell>{employeeMap.get(row.employee_id) ?? "-"}</TableCell>
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
                <TableCell className="max-w-40 truncate">{row.note ?? "-"}</TableCell>
                <TableCell className="text-right">
                  <AttendanceRecordDialog
                    employees={employees}
                    record={{ ...row, employeeName: employeeMap.get(row.employee_id) ?? "" }}
                    triggerLabel="Sửa"
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Không có dữ liệu chấm công trong khoảng thời gian này.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
