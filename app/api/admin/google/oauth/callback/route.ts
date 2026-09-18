import { cookies } from "next/headers";
import { requireProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function resultPage(message: string, token?: string) {
  const tokenBlock = token
    ? `<p><strong>Refresh token:</strong> sao chép giá trị bên dưới vào <code>GOOGLE_OAUTH_REFRESH_TOKEN</code>. Không gửi token này cho người khác.</p><textarea readonly style="width:100%;min-height:110px">${escapeHtml(token)}</textarea>`
    : `<p>${escapeHtml(message)}</p>`;
  return new Response(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Kết nối Google Sheets</title><style>body{font-family:system-ui;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.5}textarea{font-family:monospace}code{background:#f1f5f9;padding:2px 4px}</style></head><body><h1>Kết nối Google Sheets</h1>${tokenBlock}<p>Sau khi thêm biến môi trường, hãy khởi động lại app hoặc redeploy Vercel.</p></body></html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: Request) {
  const profile = await requireProfile();
  if (profile.role !== "admin") return new Response("Forbidden", { status: 403 });

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return resultPage(`Google từ chối cấp quyền: ${error}`);

  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");
  if (!state || !expectedState || state !== expectedState || !code) return resultPage("Phiên OAuth không hợp lệ hoặc đã hết hạn.");

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || `${url.origin}/api/admin/google/oauth/callback`;
  if (!clientId || !clientSecret) return resultPage("Thiếu GOOGLE_OAUTH_CLIENT_ID hoặc GOOGLE_OAUTH_CLIENT_SECRET.");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    cache: "no-store",
  });
  if (!response.ok) return resultPage("Không thể đổi mã OAuth lấy token. Kiểm tra redirect URI và OAuth client.");
  const payload = await response.json() as { refresh_token?: string };
  return payload.refresh_token ? resultPage("", payload.refresh_token) : resultPage("Google không trả refresh token. Hãy thử lại và giữ nguyên prompt=consent.");
}