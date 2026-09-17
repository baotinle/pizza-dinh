import { notFound } from "next/navigation";

export default async function AttendanceQrLandingPage({
  params,
}: {
  params: Promise<{ operation: string }>;
}) {
  const { operation } = await params;
  if (operation !== "check-in" && operation !== "check-out") notFound();

  const label = operation === "check-in" ? "Check-in" : "Check-out";

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
      <section className="w-full max-w-md rounded-lg border bg-background p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">QR {label} Pizza Đình</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Đây là mã QR chấm công dành cho nhân viên Pizza Đình. Hãy mở ứng dụng, bấm nút {label} và quét mã này tại cửa hàng.
        </p>
      </section>
    </main>
  );
}
