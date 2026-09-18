"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ScheduleImageZoom({
  src,
  showPreview = false,
  showControls = true,
}: {
  src: string;
  showPreview?: boolean;
  showControls?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {showPreview && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Xem lớn lịch làm việc"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Lịch làm việc, bấm để xem lớn" className="h-full max-h-[70vh] w-full object-contain" />
        </button>
      )}
      {showControls && (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setOpen(true)}>
            Xem/Zoom ảnh
          </Button>
          <a href={src} download target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline">
              Tải ảnh
            </Button>
          </a>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-auto max-h-[calc(100vh-2rem)] w-[min(96vw,1400px)] max-w-none overflow-auto p-2 sm:max-w-none sm:p-4">
          <DialogTitle className="sr-only">Lịch làm việc</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Lịch làm việc" className="max-h-[calc(100vh-4rem)] w-full rounded-md object-contain" />
        </DialogContent>
      </Dialog>
    </>
  );
}
