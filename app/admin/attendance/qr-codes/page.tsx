import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getAttendanceQrPayload } from "@/lib/attendance-qr";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function createQrDataUrl(payload: string | null) {
  if (!payload) return null;
  return QRCode.toDataURL(payload, { width: 360, margin: 2 });
}

export default async function AttendanceQrCodesPage() {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/employee");

  const [checkInQr, checkOutQr] = await Promise.all([
    createQrDataUrl(getAttendanceQrPayload("check-in")),
    createQrDataUrl(getAttendanceQrPayload("check-out")),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Mã QR chấm công</h1>
          <p className="text-sm text-muted-foreground">
            In hoặc mở hai mã này tại cửa hàng để nhân viên quét khi bắt đầu và kết thúc ca.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/admin/attendance" />}>Quay lại chấm công</Button>
      </div>

      {!checkInQr || !checkOutQr ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Chưa cấu hình QR_CHECK_IN_TOKEN và QR_CHECK_OUT_TOKEN trong biến môi trường.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <QrCard title="QR Check-in" description="Nhân viên quét mã này trước khi bắt đầu ca." src={checkInQr} />
          <QrCard title="QR Check-out" description="Nhân viên quét mã này sau khi kết thúc ca." src={checkOutQr} />
        </div>
      )}
    </div>
  );
}

function QrCard({ title, description, src }: { title: string; description: string; src: string }) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-lg border bg-background p-5 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={title} className="size-72 max-w-full rounded-md border" />
      <Button variant="outline" render={<a href={src} download={`${title.toLowerCase().replaceAll(" ", "-")}.png`} />}>Tải mã QR</Button>
    </section>
  );
}