"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/lib/types/domain";

export interface AttendanceFormState {
  error: string | null;
  success: boolean;
}

function toTimestamp(date: string, time: string): string | null {
  if (!time) return null;
  return new Date(`${date}T${time}:00`).toISOString();
}

export async function upsertAttendance(
  _prevState: AttendanceFormState,
  formData: FormData,
): Promise<AttendanceFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Chưa đăng nhập.", success: false };

  const employeeId = String(formData.get("employee_id") ?? "");
  const workDate = String(formData.get("work_date") ?? "");
  const status = String(formData.get("status") ?? "on_time") as AttendanceStatus;
  const checkInTime = String(formData.get("check_in_time") ?? "");
  const checkOutTime = String(formData.get("check_out_time") ?? "");
  const otHours = Number(formData.get("ot_hours") ?? 0);
  const note = String(formData.get("note") ?? "").trim();

  if (!employeeId || !workDate) {
    return { error: "Vui lòng chọn nhân viên và ngày làm việc.", success: false };
  }

  const { error } = await supabase.from("attendance").upsert(
    {
      employee_id: employeeId,
      work_date: workDate,
      status,
      check_in_time: toTimestamp(workDate, checkInTime),
      check_out_time: toTimestamp(workDate, checkOutTime),
      ot_hours: otHours,
      note: note || null,
      recorded_by: user.id,
    },
    { onConflict: "employee_id,work_date" },
  );

  if (error) return { error: error.message, success: false };

  revalidatePath("/admin/attendance");
  revalidatePath("/employee");
  return { error: null, success: true };
}
