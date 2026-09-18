import { requireProfile } from "@/lib/auth";
import { calculateNavGrowth, filterFinanceRows, readFinanceRows } from "@/lib/google-sheets-finance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await requireProfile();
  try {
    const url = new URL(request.url);
    const rows = calculateNavGrowth(filterFinanceRows(await readFinanceRows(), url.searchParams.get("from") || undefined, url.searchParams.get("to") || undefined));
    return Response.json({ rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Không thể tải dữ liệu tài chính." }, { status: 502 });
  }
}