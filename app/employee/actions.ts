"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayIsoVn } from "@/lib/date";
import { isValidAttendanceQrToken, type AttendanceQrOperation } from "@/lib/attendance-qr";

async function findOpenShift(
  supabase: ReturnType<typeof createClient> extends Promise<infer Client> ? Client : never,
  employeeId: string,
  workDate: string,
) {
  const { data } = await supabase
    .from("attendance")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("work_date", workDate)
    .not("check_in_time", "is", null)
    .is("check_out_time", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function checkIn(token: string): Promise<string | null> {
  return recordAttendance("check-in", token);
}

export async function checkOut(token: string): Promise<string | null> {
  return recordAttendance("check-out", token);
}

async function recordAttendance(operation: AttendanceQrOperation, token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Chưa đăng nhập.";
  if (!isValidAttendanceQrToken(operation, token)) {
    return operation === "check-in" ? "Mã QR Check-in không hợp lệ." : "Mã QR Check-out không hợp lệ.";
  }

  const adminSupabase = createAdminClient();

  const workDate = todayIsoVn();

  // Prevent a second check-in while a shift is still open (not yet checked out).
  const openShift = await findOpenShift(adminSupabase, user.id, workDate);
  if (operation === "check-in" && openShift) return "Bạn đang có một ca chưa Check-out.";
  if (operation === "check-out" && !openShift) return "Không có ca đang mở để Check-out.";

  const result = operation === "check-in"
    ? await adminSupabase.from("attendance").insert({
        employee_id: user.id,
        work_date: workDate,
        check_in_time: new Date().toISOString(),
        status: "on_time",
      })
    : await adminSupabase
        .from("attendance")
        .update({ check_out_time: new Date().toISOString() })
        .eq("id", openShift!.id);

  revalidatePath("/employee");
  return result.error?.message ?? null;
}

