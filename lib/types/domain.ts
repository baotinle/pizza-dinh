export type UserRole = "admin" | "employee";

export type PositionType = "bep_chinh" | "bep_phu" | "phuc_vu" | "thu_ngan";

export type AllowanceType = "per_shift" | "fixed_monthly";

export type AttendanceStatus = "on_time" | "late" | "absent" | "leave";

export type AdjustmentType = "fine" | "bonus";

export type PriorityLevel = "normal" | "urgent";

export const POSITION_LABELS: Record<PositionType, string> = {
  bep_chinh: "Bếp chính",
  bep_phu: "Bếp phụ",
  phuc_vu: "Phục vụ",
  thu_ngan: "Thu ngân",
};

export const KITCHEN_POSITIONS: PositionType[] = ["bep_chinh", "bep_phu"];

export const DEFAULT_PER_SHIFT_ALLOWANCE = 25000;
export const DEFAULT_FIXED_MONTHLY_ALLOWANCE = 200000;

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  on_time: "Đúng giờ",
  late: "Đi muộn",
  absent: "Vắng mặt",
  leave: "Nghỉ phép",
};

export const ATTENDANCE_STATUS_BADGE_CLASS: Record<AttendanceStatus, string> = {
  on_time: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  late: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
  absent: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  leave: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
};

// Auto-suggest allowance type + default rate based on job position.
export function suggestAllowance(position: PositionType): {
  allowanceType: AllowanceType;
  allowanceRate: number;
} {
  if (KITCHEN_POSITIONS.includes(position)) {
    return { allowanceType: "per_shift", allowanceRate: DEFAULT_PER_SHIFT_ALLOWANCE };
  }
  return { allowanceType: "fixed_monthly", allowanceRate: DEFAULT_FIXED_MONTHLY_ALLOWANCE };
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  position: PositionType | null;
  hourly_wage: number;
  allowance_type: AllowanceType;
  allowance_rate: number;
  bank_account_number: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SchedulePosting {
  id: string;
  image_path: string;
  start_date: string;
  end_date: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  work_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: AttendanceStatus;
  ot_hours: number;
  note: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollAdjustment {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  type: AdjustmentType;
  amount: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  content: string;
  priority: PriorityLevel;
  created_by: string | null;
  created_at: string;
}
