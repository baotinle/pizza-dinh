import { createClient } from "@/lib/supabase/server";
import { computePayrollForEmployee } from "@/lib/payroll";
import { todayIsoVn, toIsoDate } from "@/lib/date";
import type { Attendance, PayrollAdjustment, Profile } from "@/lib/types/domain";
import { PayrollFilterForm } from "./payroll-filter-form";
import { PayrollTable } from "./payroll-table";

function defaultRange() {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    from: toIsoDate(from),
    to: todayIsoVn(),
  };
}

export default async function PayrollPage({
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

  const targetEmployees =
    employeeFilter === "all" ? employees : employees.filter((e) => e.id === employeeFilter);

  const employeeIds = targetEmployees.map((e) => e.id);

  const [{ data: attendanceData }, { data: adjustmentsData }] = employeeIds.length
    ? await Promise.all([
        supabase
          .from("attendance")
          .select("*")
          .in("employee_id", employeeIds)
          .gte("work_date", from)
          .lte("work_date", to),
        supabase
          .from("payroll_adjustments")
          .select("*")
          .in("employee_id", employeeIds)
          .gte("period_start", from)
          .lte("period_end", to),
      ])
    : [{ data: [] }, { data: [] }];

  const attendanceRows = (attendanceData ?? []) as Attendance[];
  const adjustmentRows = (adjustmentsData ?? []) as PayrollAdjustment[];

  const periodStart = new Date(from);
  const periodEnd = new Date(to);

  const payrollRows = targetEmployees.map((employee) =>
    computePayrollForEmployee(
      employee,
      attendanceRows.filter((a) => a.employee_id === employee.id),
      adjustmentRows.filter((a) => a.employee_id === employee.id),
      periodStart,
      periodEnd,
    ),
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Bảng lương</h1>
        <p className="text-sm text-muted-foreground">
          Tổng thu nhập = (Giờ làm × Lương/giờ) + Phụ cấp − Phạt + Thưởng.
        </p>
      </div>

      <PayrollFilterForm
        employees={employees}
        defaultFrom={from}
        defaultTo={to}
        defaultEmployeeId={employeeFilter}
      />

      <PayrollTable rows={payrollRows} periodStart={from} periodEnd={to} />
    </div>
  );
}
