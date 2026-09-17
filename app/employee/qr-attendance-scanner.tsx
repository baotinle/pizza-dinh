"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AttendanceQrOperation } from "@/lib/attendance-qr";

export function QrAttendanceScanner({
  operation,
  open,
  isPending,
  error,
  onScan,
  onClose,
}: {
  operation: AttendanceQrOperation;
  open: boolean;
  isPending: boolean;
  error: string | null;
  onScan: (token: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !videoRef.current) return;

    const reader = new BrowserQRCodeReader();
    let controls: { stop: () => void } | undefined;
    let scanned = false;

    reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        videoRef.current,
        (result, error) => {
          if (result && !scanned) {
            scanned = true;
            onScan(result.getText());
          }
          if (error && error.name !== "NotFoundException") {
            setScannerError("Không thể đọc camera. Vui lòng thử lại.");
          }
        },
      )
      .then((nextControls) => {
        controls = nextControls;
      })
      .catch(() => {
        setScannerError("Không thể mở camera. Hãy cấp quyền camera cho trình duyệt.");
      });

    return () => controls?.stop();
  }, [open, onScan]);

  const title = operation === "check-in" ? "Quét QR Check-in" : "Quét QR Check-out";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <video ref={videoRef} className="aspect-video w-full rounded-md bg-black object-cover" muted playsInline />
          <p className="text-sm text-muted-foreground">
            Đưa mã QR {operation === "check-in" ? "Check-in" : "Check-out"} tại cửa hàng vào khung hình.
          </p>
          {(scannerError || error) && <p className="text-sm text-destructive">{scannerError || error}</p>}
          {isPending && <p className="text-sm text-muted-foreground">Đang xác nhận mã QR...</p>}
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}