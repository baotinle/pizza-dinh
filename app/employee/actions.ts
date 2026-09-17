"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function checkIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập.");

  const workDate = todayIso();
  const { data: existing } = await supabase
    .from("attendance")
    .select("id, check_in_time")
    .eq("employee_id", user.id)
    .eq("work_date", workDate)
    .maybeSingle();

  if (existing?.check_in_time) return;

  if (existing) {
    await supabase
      .from("attendance")
      .update({ check_in_time: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("attendance").insert({
      employee_id: user.id,
      work_date: workDate,
      check_in_time: new Date().toISOString(),
      status: "on_time",
    });
  }

  revalidatePath("/employee");
}

export async function checkOut() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập.");

  const workDate = todayIso();
  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("employee_id", user.id)
    .eq("work_date", workDate)
    .maybeSingle();

  if (!existing) return;

  await supabase
    .from("attendance")
    .update({ check_out_time: new Date().toISOString() })
    .eq("id", existing.id);

  revalidatePath("/employee");
}
