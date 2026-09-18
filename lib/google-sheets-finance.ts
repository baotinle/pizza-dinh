export const FINANCE_SPREADSHEET_ID = "16JzCninkZcBQWOaVIZceq-5wO4NajA-3GOQFEoxqYu0";
const DEFAULT_SHEET_NAME = "Hàng ngày";

export type FinanceRow = {
  date: string;
  dateLabel: string;
  cash: number | null;
  bank: number | null;
  nav: number | null;
  revenue: number | null;
  expense: number | null;
  navGrowthPct: number | null;
};

type GoogleTokenResponse = { access_token: string };

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu biến môi trường ${name}.`);
  return value;
}

function normalizeHeader(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseDate(value: string): string | null {
  const trimmed = value.trim();
  const vietnamese = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (vietnamese) {
    const [, day, month, year] = vietnamese;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day)
      ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      : null;
  }

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!iso) return null;
  const date = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : `${iso[1]}-${iso[2]}-${iso[3]}`;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/\s/g, "").replace(/[^\d,.-]/g, "");
  if (!cleaned) return null;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized = cleaned;
  if (lastComma >= 0 && lastDot >= 0) {
    normalized = lastComma > lastDot ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(/,/g, "");
  } else if (lastComma >= 0) {
    const decimals = cleaned.length - lastComma - 1;
    normalized = decimals === 3 ? cleaned.replace(/,/g, "") : cleaned.replace(",", ".");
  } else if (lastDot >= 0) {
    const decimals = cleaned.length - lastDot - 1;
    normalized = decimals === 3 ? cleaned.replace(/\./g, "") : cleaned;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

async function getAccessToken() {
  const clientId = requiredEnv("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = requiredEnv("GOOGLE_OAUTH_CLIENT_SECRET");
  const refreshToken = requiredEnv("GOOGLE_OAUTH_REFRESH_TOKEN");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Không thể xác thực với Google Sheets.");
  return (await response.json() as GoogleTokenResponse).access_token;
}

export async function readFinanceRows(): Promise<FinanceRow[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || FINANCE_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_TAB || DEFAULT_SHEET_NAME;
  const token = await getAccessToken();
  const range = `'${sheetName.replace(/'/g, "''")}'!A:Z`;
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Không thể đọc dữ liệu Google Sheets.");
  const payload = await response.json() as { values?: unknown[][] };
  const values = payload.values ?? [];
  if (values.length < 2) return [];

  const headers = values[0].map((header) => normalizeHeader(String(header ?? "")));
  const findColumn = (...names: string[]) => headers.findIndex((header) => names.includes(header));
  const columns = {
    date: findColumn("ngay", "date"),
    cash: findColumn("cuoicacash", "cash"),
    bank: findColumn("cuoicabank", "bank"),
    nav: findColumn("nav"),
    revenue: findColumn("doanhthu", "revenue"),
    expense: findColumn("chiphi", "expense"),
  };
  if (columns.date < 0) throw new Error("Google Sheets thiếu cột Ngày.");

  const rows = values.slice(1).flatMap((row) => {
    const date = parseDate(String(row[columns.date] ?? ""));
    if (!date) return [];
    return [{
      date,
      dateLabel: new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`)),
      cash: columns.cash < 0 ? null : parseNumber(row[columns.cash]),
      bank: columns.bank < 0 ? null : parseNumber(row[columns.bank]),
      nav: columns.nav < 0 ? null : parseNumber(row[columns.nav]),
      revenue: columns.revenue < 0 ? null : parseNumber(row[columns.revenue]),
      expense: columns.expense < 0 ? null : parseNumber(row[columns.expense]),
    }];
  });

  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows.map((row, index) => {
    const previous = rows[index - 1]?.nav;
    return {
      ...row,
      navGrowthPct: row.nav !== null && previous !== null && previous !== undefined && previous !== 0 ? ((row.nav - previous) / Math.abs(previous)) * 100 : null,
    };
  });
}

export function filterFinanceRows(rows: FinanceRow[], from?: string, to?: string) {
  return rows.filter((row) => (!from || row.date >= from) && (!to || row.date <= to));
}

export function calculateNavGrowth(rows: FinanceRow[]) {
  const baselineNav = rows[0]?.nav;
  return rows.map((row, index) => {
    return {
      ...row,
      navGrowthPct:
        index > 0 && row.nav !== null && baselineNav !== null && baselineNav !== undefined && baselineNav !== 0
          ? ((row.nav - baselineNav) / Math.abs(baselineNav)) * 100
          : null,
    };
  });
}