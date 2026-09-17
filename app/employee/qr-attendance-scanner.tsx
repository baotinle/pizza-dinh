"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);

  const startCamera = useCallback(async () => {
    const video = videoRef.current;
    if (!video || streamRef.current) return;

    setScannerError(null);
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = cameraStream;
      video.srcObject = cameraStream;
      video.setAttribute("playsinline", "true");
      await video.play();

      const reader = new BrowserQRCodeReader();
      readerRef.current = reader;
      let scanned = false;
      controlsRef.current = await reader.decodeFromStream(cameraStream, video, (result, error) => {
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
          setScannerError("Không thể đọc mã QR. Hãy đưa mã vào giữa khung hình.");
        }
      });
      setCameraStarted(true);
    } catch (cameraError) {
      const name = cameraError instanceof DOMException ? cameraError.name : "";
      setScannerError(
        name === "NotAllowedError"
          ? "Camera đang bị chặn. Hãy bật quyền Camera cho trình duyệt rồi bấm Bật camera."
          : "Không thể mở camera trên thiết bị này. Hãy bấm Bật camera để thử lại.",
      );
    }
  }, [onScan]);

  useEffect(() => {
    if (!open) return;
    const video = videoRef.current;

    return () => {
      controlsRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (video) video.srcObject = null;
      controlsRef.current = null;
      streamRef.current = null;
      readerRef.current = null;
    };
  }, [open]);

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
          {!cameraStarted && (
            <Button type="button" onClick={() => void startCamera()}>
              Bật camera
            </Button>
          )}
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