"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AllowanceType, PositionType } from "@/lib/types/domain";

export interface EmployeeFormState {
  error: string | null;
  success: boolean;
}

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Không có quyền truy cập.");
  return { supabase, adminId: user.id };
}

function parseEmployeeForm(formData: FormData) {
  return {
    fullName: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    position: String(formData.get("position") ?? "") as PositionType,
    hourlyWage: Number(formData.get("hourly_wage") ?? 0),
    allowanceType: String(formData.get("allowance_type") ?? "fixed_monthly") as AllowanceType,
    allowanceRate: Number(formData.get("allowance_rate") ?? 0),
    bankAccountNumber: String(formData.get("bank_account_number") ?? "").trim(),
  };
}

export async function createEmployee(
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  try {
    await assertAdmin();
    const input = parseEmployeeForm(formData);
    const password = String(formData.get("password") ?? "");

    if (!input.fullName || !input.phone || !password) {
      return { error: "Vui lòng nhập đầy đủ Họ tên, SĐT và Mật khẩu.", success: false };
    }

    const email = input.email || `${input.phone}@pizzadinh.local`;
    const adminClient = createAdminClient();

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    });

    if (createError || !created.user) {
      return { error: createError?.message ?? "Không thể tạo tài khoản.", success: false };
    }

    const { error: profileError } = await adminClient.from("profiles").insert({
      id: created.user.id,
      full_name: input.fullName,
      phone: input.phone,
      email,
      role: "employee",
      position: input.position,
      hourly_wage: input.hourlyWage,
      allowance_type: input.allowanceType,
      allowance_rate: input.allowanceRate,
      bank_account_number: input.bankAccountNumber || null,
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      return { error: profileError.message, success: false };
    }

    revalidatePath("/admin/employees");
    return { error: null, success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Đã xảy ra lỗi.", success: false };
  }
}

export async function updateEmployee(
  employeeId: string,
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  try {
    const { supabase } = await assertAdmin();
    const input = parseEmployeeForm(formData);

    if (!input.fullName || !input.phone) {
      return { error: "Vui lòng nhập đầy đủ Họ tên và SĐT.", success: false };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: input.fullName,
        phone: input.phone,
        email: input.email || null,
        position: input.position,
        hourly_wage: input.hourlyWage,
        allowance_type: input.allowanceType,
        allowance_rate: input.allowanceRate,
        bank_account_number: input.bankAccountNumber || null,
      })
      .eq("id", employeeId);

    if (error) return { error: error.message, success: false };

    revalidatePath("/admin/employees");
    return { error: null, success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Đã xảy ra lỗi.", success: false };
  }
}

export async function setEmployeeActive(employeeId: string, isActive: boolean) {
  const { supabase } = await assertAdmin();
  await supabase.from("profiles").update({ is_active: isActive }).eq("id", employeeId);
  revalidatePath("/admin/employees");
}

// Deleting the auth user cascades to profiles, attendance, and payroll_adjustments (FK on delete cascade).
export async function deleteEmployee(employeeId: string): Promise<EmployeeFormState> {
  try {
    await assertAdmin();
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(employeeId);
    if (error) return { error: error.message, success: false };

    revalidatePath("/admin/employees");
    return { error: null, success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Đã xảy ra lỗi.", success: false };
  }
}
