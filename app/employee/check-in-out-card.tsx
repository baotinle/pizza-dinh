"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { checkIn, checkOut } from "./actions";

export function CheckInOutCard({
  checkInTime,
  checkOutTime,
}: {
  checkInTime: string | null;
  checkOutTime: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <p className="font-medium">Chấm công hôm nay</p>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Giờ vào: {checkInTime ? new Date(checkInTime).toLocaleTimeString("vi-VN") : "-"}</span>
        <span>
          Giờ ra: {checkOutTime ? new Date(checkOutTime).toLocaleTimeString("vi-VN") : "-"}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          disabled={isPending || Boolean(checkInTime)}
          onClick={() => startTransition(() => checkIn())}
        >
          Check-in
        </Button>
        <Button
          variant="outline"
          disabled={isPending || !checkInTime || Boolean(checkOutTime)}
          onClick={() => startTransition(() => checkOut())}
        >
          Check-out
        </Button>
      </div>
    </div>
  );
}
