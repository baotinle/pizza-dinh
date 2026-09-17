"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface LoginState {
  error: string | null;
}

// Accepts either an email or a phone number as the login identifier.
export async function signIn(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return { error: "Vui lòng nhập đầy đủ thông tin đăng nhập." };
  }

  let email = identifier;
  if (!identifier.includes("@")) {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from("profiles")
      .select("email")
      .eq("phone", identifier)
      .maybeSingle();
    if (!data?.email) {
      return { error: "Không tìm thấy tài khoản với số điện thoại này." };
    }
    email = data.email;
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !signInData.user) {
    return { error: "Số điện thoại/Email hoặc mật khẩu không đúng." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", signInData.user.id)
    .single();

  redirect(profile?.role === "admin" ? "/admin" : "/employee");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
