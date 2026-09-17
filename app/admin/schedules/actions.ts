"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteSchedulePosting(id: string, imagePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("schedules").remove([imagePath]);
  await supabase.from("schedule_postings").delete().eq("id", id);
  revalidatePath("/admin/schedules");
  revalidatePath("/employee");
}
