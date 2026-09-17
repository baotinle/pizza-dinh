"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteSchedulePosting } from "./actions";

export function DeleteScheduleButton({ id, imagePath }: { id: string; imagePath: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => deleteSchedulePosting(id, imagePath))}
    >
      Xóa
    </Button>
  );
}
