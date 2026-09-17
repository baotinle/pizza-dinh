import "server-only";

export type AttendanceQrOperation = "check-in" | "check-out";

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