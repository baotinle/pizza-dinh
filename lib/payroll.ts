import type { Attendance, PayrollAdjustment, Profile } from "@/lib/types/domain";

export interface PayrollRow {
  employeeId: string;
  fullName: string;
  totalHours: number;
  totalShifts: number;
  baseWage: number;
  allowance: number;
  fines: number;
  bonuses: number;
  totalIncome: number;
}

export function hoursBetween(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return ms > 0 ? ms / 1000 / 60 / 60 : 0;
}

// Number of whole months covered by [periodStart, periodEnd], for fixed-monthly allowance proration.
function monthsCoveredFraction(periodStart: Date, periodEnd: Date): number {
  const days = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
  const daysInMonth = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).getDate();
  return Math.min(days / daysInMonth, 1) || days / 30;
}

export function computePayrollForEmployee(
  profile: Profile,
  attendanceRows: Attendance[],
  adjustments: PayrollAdjustment[],
  periodStart: Date,
  periodEnd: Date,
): PayrollRow {
  const totalHours = attendanceRows.reduce(
    (sum, a) => sum + hoursBetween(a.check_in_time, a.check_out_time),
    0,
  );
  const totalShifts = attendanceRows.filter(
    (a) => a.status === "on_time" || a.status === "late",
  ).length;
  const baseWage = totalHours * profile.hourly_wage;

  const allowance =
    profile.allowance_type === "per_shift"
      ? totalShifts * profile.allowance_rate
      : profile.allowance_rate * monthsCoveredFraction(periodStart, periodEnd);

  const fines = adjustments
    .filter((a) => a.type === "fine")
    .reduce((sum, a) => sum + Number(a.amount), 0);
  const bonuses = adjustments
    .filter((a) => a.type === "bonus")
    .reduce((sum, a) => sum + Number(a.amount), 0);

  const totalIncome = baseWage + allowance - fines + bonuses;

  return {
    employeeId: profile.id,
    fullName: profile.full_name,
    totalHours: Math.round(totalHours * 100) / 100,
    totalShifts,
    baseWage: Math.round(baseWage),
    allowance: Math.round(allowance),
    fines: Math.round(fines),
    bonuses: Math.round(bonuses),
    totalIncome: Math.round(totalIncome),
  };
}

export function toCsv(rows: PayrollRow[]): string {
  const header = [
    "Họ tên",
    "Tổng giờ làm",
    "Tổng số ca",
    "Lương cơ bản",
    "Phụ cấp",
    "Tiền phạt",
    "Tiền thưởng",
    "Tổng thu nhập",
  ];
  const lines = rows.map((r) =>
    [
      r.fullName,
      r.totalHours,
      r.totalShifts,
      r.baseWage,
      r.allowance,
      r.fines,
      r.bonuses,
      r.totalIncome,
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
