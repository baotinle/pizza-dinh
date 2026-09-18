import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { requireProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const profile = await requireProfile();
  if (profile.role !== "admin") return new Response("Forbidden", { status: 403 });

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || `${new URL(request.url).origin}/api/admin/google/oauth/callback`;
  if (!clientId) return new Response("Thiếu GOOGLE_OAUTH_CLIENT_ID.", { status: 500 });

  const state = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    state,
  });
  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}