"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ScheduleImageZoom({ src }: { src: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">Lịch làm việc</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Lịch làm việc" className="w-full rounded-md" />
        </DialogContent>
      </Dialog>
    </>
  );
}
