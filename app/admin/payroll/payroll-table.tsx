"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toCsv, type PayrollRow } from "@/lib/payroll";
import { addAdjustment, type AdjustmentFormState } from "./actions";

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " đ";
}

function downloadCsv(rows: PayrollRow[], from: string, to: string) {
  const csv = toCsv(rows);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bang-luong_${from}_${to}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function PayrollTable({
  rows,
  periodStart,
  periodEnd,
}: {
  rows: PayrollRow[];
  periodStart: string;
  periodEnd: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button
          variant="outline"
          disabled={rows.length === 0}
          onClick={() => downloadCsv(rows, periodStart, periodEnd)}
        >
          Xuất CSV
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Giờ làm</TableHead>
              <TableHead>Số ca</TableHead>
              <TableHead>Lương cơ bản</TableHead>
              <TableHead>Phụ cấp</TableHead>
              <TableHead>Phạt</TableHead>
              <TableHead>Thưởng</TableHead>
              <TableHead>Tổng thu nhập</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.employeeId}>
                <TableCell className="font-medium">{row.fullName}</TableCell>
                <TableCell>{row.totalHours}</TableCell>
                <TableCell>{row.totalShifts}</TableCell>
                <TableCell>{formatVnd(row.baseWage)}</TableCell>
                <TableCell>{formatVnd(row.allowance)}</TableCell>
                <TableCell className="text-destructive">{formatVnd(row.fines)}</TableCell>
                <TableCell className="text-emerald-600">{formatVnd(row.bonuses)}</TableCell>
                <TableCell className="font-semibold">{formatVnd(row.totalIncome)}</TableCell>
                <TableCell className="text-right">
                  <AdjustmentDialog
                    employeeId={row.employeeId}
                    periodStart={periodStart}
                    periodEnd={periodEnd}
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Không có dữ liệu trong khoảng thời gian này.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const initialState: AdjustmentFormState = { error: null, success: false };

function AdjustmentDialog({
  employeeId,
  periodStart,
  periodEnd,
}: {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
}) {
  const action = addAdjustment.bind(null, employeeId, periodStart, periodEnd);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close dialog once the server action reports success
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm">+ Phạt/Thưởng</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm khoản phạt/thưởng</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Loại</Label>
            <Select name="type" defaultValue="fine">
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fine">Tiền phạt</SelectItem>
                <SelectItem value="bonus">Tiền thưởng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="incident_date">Ngày phát sinh</Label>
            <Input
              id="incident_date"
              name="incident_date"
              type="date"
              min={periodStart}
              max={periodEnd}
              defaultValue={periodStart}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Số tiền (VNĐ)</Label>
            <Input id="amount" name="amount" type="number" min={0} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Lý do / nội dung</Label>
            <Input id="note" name="note" placeholder="Ví dụ: Làm vỡ cốc" required />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
