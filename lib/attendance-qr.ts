import "server-only";

export type AttendanceQrOperation = "check-in" | "check-out";

export function getAttendanceQrPayload(operation: AttendanceQrOperation) {
  const token = getAttendanceQrToken(operation);
  if (!token) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const path = operation === "check-in" ? "check-in" : "check-out";
  return `${baseUrl.replace(/\/$/, "")}/attendance/qr/${path}?token=${encodeURIComponent(token)}`;
}

export function getAttendanceQrToken(operation: AttendanceQrOperation) {
  return operation === "check-in"
    ? process.env.QR_CHECK_IN_TOKEN
    : process.env.QR_CHECK_OUT_TOKEN;
}

export function isValidAttendanceQrToken(
  operation: AttendanceQrOperation,
  token: string,
) {
  const expectedToken = getAttendanceQrToken(operation);
  return Boolean(expectedToken && token.trim() && token.trim() === expectedToken);
}