import { createClient } from "@/lib/supabase/server";
import { computePayrollForEmployee } from "@/lib/payroll";
import { currentPayrollPeriodVn } from "@/lib/date";
import type { Attendance, PayrollAdjustment, Profile } from "@/lib/types/domain";
import { PayrollFilterForm } from "./payroll-filter-form";
import { PayrollTable } from "./payroll-table";
import { StatCard } from "../attendance/stat-card";
import { getSelectedEmployeeIds, toParamArray } from "@/lib/employee-filter";

function defaultRange() {
  return currentPayrollPeriodVn();
}

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; employee?: string | string[] }>;
}) {
  const params = await searchParams;
  const defaults = defaultRange();
  const from = params.from || defaults.from;
  const to = params.to || defaults.to;

  const supabase = await createClient();

  const { data: employeesData } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "employee")
    .order("full_name");
  const employees = (employeesData ?? []) as Profile[];
  const selectedEmployeeIds = getSelectedEmployeeIds(params.employee, employees);

  const targetEmployees = employees.filter((employee) => selectedEmployeeIds.includes(employee.id));

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
          .gte("incident_date", from)
          .lte("incident_date", to),
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
        defaultEmployeeIds={toParamArray(params.employee).filter((value) => value !== "all")}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Tổng giờ làm" value={payrollRows.reduce((sum, row) => sum + row.totalHours, 0).toFixed(1)} />
        <StatCard label="Tổng số ca" value={payrollRows.reduce((sum, row) => sum + row.totalShifts, 0)} />
        <StatCard label="Tổng phụ cấp" value={`${payrollRows.reduce((sum, row) => sum + row.allowance, 0).toLocaleString("vi-VN")} đ`} />
        <StatCard label="Tổng phạt" value={`${payrollRows.reduce((sum, row) => sum + row.fines, 0).toLocaleString("vi-VN")} đ`} />
        <StatCard label="Tổng thưởng" value={`${payrollRows.reduce((sum, row) => sum + row.bonuses, 0).toLocaleString("vi-VN")} đ`} />
        <StatCard label="Tổng thu nhập" value={`${payrollRows.reduce((sum, row) => sum + row.totalIncome, 0).toLocaleString("vi-VN")} đ`} />
      </div>

      <PayrollTable rows={payrollRows} periodStart={from} periodEnd={to} />
    </div>
  );
}
