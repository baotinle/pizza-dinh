"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateVn } from "@/lib/date";
import type { PayrollAdjustment } from "@/lib/types/domain";

function formatVnd(amount: number) {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export function AdjustmentDetailsDialog({
  adjustments,
}: {
  adjustments: PayrollAdjustment[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" disabled={adjustments.length === 0}>
            Xem chi tiết khoản phạt/thưởng
          </Button>
        }
      />
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết khoản phạt/thưởng</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {adjustments.map((adjustment) => {
            const isFine = adjustment.type === "fine";
            return (
              <div key={adjustment.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className={isFine ? "font-medium text-destructive" : "font-medium text-emerald-600"}>
                    {isFine ? "Khoản phạt" : "Khoản thưởng"}
                  </p>
                  <p className={isFine ? "font-semibold text-destructive" : "font-semibold text-emerald-600"}>
                    {isFine ? "-" : "+"}{formatVnd(Number(adjustment.amount))}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ngày phát sinh: {formatDateVn(adjustment.incident_date)}
                </p>
                <p className="mt-1 text-sm">Lý do: {adjustment.note || "Không có ghi chú"}</p>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}