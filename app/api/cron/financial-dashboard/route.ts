import { readFinanceRows } from "@/lib/google-sheets-finance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) return new Response("Unauthorized", { status: 401 });
  try {
    const rows = await readFinanceRows();
    return Response.json({ ok: true, rows: rows.length, latestDate: rows.at(-1)?.date ?? null });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Không thể đọc dữ liệu tài chính." }, { status: 502 });
  }
}