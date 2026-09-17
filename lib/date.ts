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
