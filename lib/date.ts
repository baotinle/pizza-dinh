export function formatDateVn(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

// Vietnam has no DST, so a fixed offset always converts correctly regardless of server timezone.
const VN_TZ = "Asia/Ho_Chi_Minh";

export function formatTimeVn(iso: string): string {
  return new Date(iso).toLocaleTimeString("vi-VN", {
    timeZone: VN_TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDateTimeVn(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { timeZone: VN_TZ });
}

// Formats a Date's own calendar components (no UTC conversion) — safe for dates built from y/m/d.
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Today's calendar date in Vietnam, regardless of the server process's own timezone (e.g. UTC on Vercel).
export function todayIsoVn(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: VN_TZ }).format(new Date());
}

export function currentPayrollPeriodVn(): { from: string; to: string } {
  const [year, month] = todayIsoVn().split("-").map(Number);
  const currentDay = Number(todayIsoVn().split("-")[2]);
  const periodStartMonth = currentDay < 6 ? month - 2 : month - 1;
  const periodEndMonth = currentDay < 6 ? month - 1 : month;
  return {
    from: toIsoDate(new Date(year, periodStartMonth, 6)),
    to: toIsoDate(new Date(year, periodEndMonth, 5)),
  };
}
