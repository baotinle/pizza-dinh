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
    let stream: MediaStream | null = null;
    let controls: { stop: () => void } | undefined;
    let scanned = false;

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      })
      .then(async (cameraStream) => {
        stream = cameraStream;
        video.srcObject = cameraStream;
        await video.play();

        controls = await reader.decodeFromStream(cameraStream, video, (result, error) => {
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
        });
      })
      .catch(() => {
        setScannerError("Không thể mở camera. Hãy cấp quyền camera cho trình duyệt.");
      });

    return () => {
      controls?.stop();
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    };
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