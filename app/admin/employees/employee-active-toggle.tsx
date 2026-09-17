"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setEmployeeActive } from "./actions";

export function EmployeeActiveToggle({
  employeeId,
  isActive,
}: {
  employeeId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => setEmployeeActive(employeeId, !isActive))}
    >
      {isActive ? "Ngừng làm" : "Kích hoạt lại"}
    </Button>
  );
}
