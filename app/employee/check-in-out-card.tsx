"use client";

import { useCallback, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { formatTimeVn } from "@/lib/date";
import type { Attendance } from "@/lib/types/domain";
import { checkIn, checkOut } from "./actions";
import { QrAttendanceScanner } from "./qr-attendance-scanner";

export function CheckInOutCard({ shifts }: { shifts: Attendance[] }) {
  const [isPending, startTransition] = useTransition();
  const [scanner, setScanner] = useState<"check-in" | "check-out" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const openShift = shifts.find((s) => s.check_in_time && !s.check_out_time);

  const handleScan = useCallback((token: string) => {
    if (!scanner) return;
    startTransition(async () => {
      const result = scanner === "check-in" ? await checkIn(token) : await checkOut(token);
      if (result) {
        setError(result);
        return;
      }
      setError(null);
      setScanner(null);
    });
  }, [scanner]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <p className="font-medium">Chấm công hôm nay</p>
      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        {shifts.length === 0 && <span>Chưa có ca làm nào hôm nay.</span>}
        {shifts.map((s) => (
          <div key={s.id} className="flex gap-4">
            <span>Giờ vào: {s.check_in_time ? formatTimeVn(s.check_in_time) : "-"}</span>
            <span>Giờ ra: {s.check_out_time ? formatTimeVn(s.check_out_time) : "-"}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          disabled={isPending || Boolean(openShift)}
          onClick={() => {
            setError(null);
            setScanner("check-in");
          }}
        >
          Check-in
        </Button>
        <Button
          variant="outline"
          disabled={isPending || !openShift}
          onClick={() => {
            setError(null);
            setScanner("check-out");
          }}
        >
          Check-out
        </Button>
      </div>
      {scanner && (
        <QrAttendanceScanner
          operation={scanner}
          open
          isPending={isPending}
          error={error}
          onScan={handleScan}
          onClose={() => {
            if (!isPending) {
              setError(null);
              setScanner(null);
            }
          }}
        />
      )}
    </div>
  );
}

