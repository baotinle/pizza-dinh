"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteEmployee } from "./actions";

export function EmployeeDeleteButton({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEmployee(employeeId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm">Xóa</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa nhân viên {employeeName}?</DialogTitle>
          <DialogDescription>
            Hành động này xóa vĩnh viễn tài khoản và <strong>toàn bộ lịch sử chấm công,
            phụ cấp, phạt/thưởng</strong> của nhân viên này — không thể khôi phục. Nếu chỉ
            muốn ẩn nhân viên đã nghỉ nhưng vẫn giữ lịch sử, hãy dùng nút &quot;Ngừng làm&quot;
            thay vì xóa.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="destructive" disabled={isPending} onClick={handleDelete}>
            {isPending ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
