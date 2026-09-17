"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ATTENDANCE_STATUS_LABELS, type Attendance, type Profile } from "@/lib/types/domain";
import { upsertAttendance, type AttendanceFormState } from "./actions";

const initialState: AttendanceFormState = { error: null, success: false };

function toTimeInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toTimeString().slice(0, 5);
}

export function AttendanceRecordDialog({
  employees,
  record,
  triggerLabel,
}: {
  employees: Profile[];
  record?: Attendance & { employeeName: string };
  triggerLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(upsertAttendance, initialState);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close dialog once the server action reports success
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={record ? "outline" : "default"} size={record ? "sm" : "default"}>
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? "Sửa chấm công" : "Thêm bản ghi chấm công"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid grid-cols-2 gap-4">
          <input type="hidden" name="id" value={record?.id ?? ""} />
          <div className="col-span-2 flex flex-col gap-2">
            <Label htmlFor="employee_id">Nhân viên</Label>
            <Select name="employee_id" defaultValue={record?.employee_id} required>
              <SelectTrigger id="employee_id">
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="work_date">Ngày làm việc</Label>
            <Input
              id="work_date"
              name="work_date"
              type="date"
              defaultValue={record?.work_date}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select name="status" defaultValue={record?.status ?? "on_time"}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="check_in_time">Giờ vào</Label>
            <Input
              id="check_in_time"
              name="check_in_time"
              type="time"
              defaultValue={toTimeInput(record?.check_in_time ?? null)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="check_out_time">Giờ ra</Label>
            <Input
              id="check_out_time"
              name="check_out_time"
              type="time"
              defaultValue={toTimeInput(record?.check_out_time ?? null)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ot_hours">Giờ tăng ca (OT)</Label>
            <Input
              id="ot_hours"
              name="ot_hours"
              type="number"
              min={0}
              step={0.5}
              defaultValue={record?.ot_hours ?? 0}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <Label htmlFor="note">Ghi chú / Lý do đi muộn</Label>
            <Input id="note" name="note" defaultValue={record?.note ?? ""} />
          </div>
          {state.error && <p className="col-span-2 text-sm text-destructive">{state.error}</p>}
          <DialogFooter className="col-span-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
