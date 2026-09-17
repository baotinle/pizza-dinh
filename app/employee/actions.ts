"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function findOpenShift(
  supabase: Awaited<ReturnType<typeof createClient>>,
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

export async function checkIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập.");

  const workDate = todayIso();

  // Prevent a second check-in while a shift is still open (not yet checked out).
  const openShift = await findOpenShift(supabase, user.id, workDate);
  if (openShift) return;

  await supabase.from("attendance").insert({
    employee_id: user.id,
    work_date: workDate,
    check_in_time: new Date().toISOString(),
    status: "on_time",
  });

  revalidatePath("/employee");
}

export async function checkOut() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập.");

  const workDate = todayIso();

  const openShift = await findOpenShift(supabase, user.id, workDate);
  if (!openShift) return;

  await supabase
    .from("attendance")
    .update({ check_out_time: new Date().toISOString() })
    .eq("id", openShift.id);

  revalidatePath("/employee");
}

