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
    const video = videoRef.current;
    let controls: { stop: () => void } | undefined;
    let scanned = false;

    reader
      .decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: "environment" } } },
        video,
        (result, error) => {
          if (result && !scanned) {
            scanned = true;
            const scannedValue = result.getText();
            try {
              const url = new URL(scannedValue);
              onScan(url.searchParams.get("token") ?? scannedValue);
            } catch {
              onScan(scannedValue);
            }
          }
          if (error && error.name !== "NotFoundException") {
            setScannerError("Không thể đọc camera. Vui lòng thử lại.");
          }
        },
      )
      .then((nextControls) => {
        controls = nextControls;
        video.play().catch(() => {
          setScannerError("Không thể phát camera. Hãy cho phép camera rồi thử lại.");
        });
        const stream = video.srcObject as MediaStream | null;
        if (!stream || stream.getVideoTracks().length === 0) {
          setScannerError("Không tìm thấy camera trên thiết bị này.");
        }
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
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full rounded-md bg-black object-cover"
          />
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