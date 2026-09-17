"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PriorityLevel } from "@/lib/types/domain";

export interface AnnouncementFormState {
  error: string | null;
  success: boolean;
}

export async function createAnnouncement(
  _prevState: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Chưa đăng nhập.", success: false };

  const content = String(formData.get("content") ?? "").trim();
  const priority = String(formData.get("priority") ?? "normal") as PriorityLevel;

  if (!content) return { error: "Vui lòng nhập nội dung thông báo.", success: false };

  const { error } = await supabase.from("announcements").insert({
    content,
    priority,
    created_by: user.id,
  });

  if (error) return { error: error.message, success: false };

  revalidatePath("/admin/announcements");
  revalidatePath("/employee");
  return { error: null, success: true };
}
