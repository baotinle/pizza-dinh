"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AdjustmentType } from "@/lib/types/domain";

export interface AdjustmentFormState {
  error: string | null;
  success: boolean;
}

export async function addAdjustment(
  employeeId: string,
  periodStart: string,
  periodEnd: string,
  _prevState: AdjustmentFormState,
  formData: FormData,
): Promise<AdjustmentFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Chưa đăng nhập.", success: false };

  const type = String(formData.get("type") ?? "fine") as AdjustmentType;
  const amount = Number(formData.get("amount") ?? 0);
  const incidentDate = String(formData.get("incident_date") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (type !== "fine" && type !== "bonus") {
    return { error: "Loại khoản điều chỉnh không hợp lệ.", success: false };
  }

  if (!amount || amount <= 0) {
    return { error: "Vui lòng nhập số tiền hợp lệ.", success: false };
  }

  if (!note) {
    return { error: "Vui lòng nhập lý do phạt/thưởng.", success: false };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(incidentDate) || incidentDate < periodStart || incidentDate > periodEnd) {
    return { error: "Ngày phát sinh phải nằm trong khoảng thời gian đang chọn.", success: false };
  }

  const { error } = await supabase.from("payroll_adjustments").insert({
    employee_id: employeeId,
    incident_date: incidentDate,
    period_start: periodStart,
    period_end: periodEnd,
    type,
    amount,
    note,
    created_by: user.id,
  });

  if (error) return { error: error.message, success: false };

  revalidatePath("/admin/payroll");
  revalidatePath("/employee/timesheet");
  return { error: null, success: true };
}
