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
  const note = String(formData.get("note") ?? "").trim();

  if (!amount || amount <= 0) {
    return { error: "Vui lòng nhập số tiền hợp lệ.", success: false };
  }

  const { error } = await supabase.from("payroll_adjustments").insert({
    employee_id: employeeId,
    period_start: periodStart,
    period_end: periodEnd,
    type,
    amount,
    note: note || null,
    created_by: user.id,
  });

  if (error) return { error: error.message, success: false };

  revalidatePath("/admin/payroll");
  return { error: null, success: true };
}
