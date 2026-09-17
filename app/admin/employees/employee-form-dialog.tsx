"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { createEmployee, updateEmployee, type EmployeeFormState } from "./actions";
import {
  POSITION_LABELS,
  suggestAllowance,
  type AllowanceType,
  type PositionType,
  type Profile,
} from "@/lib/types/domain";

const initialState: EmployeeFormState = { error: null, success: false };

export function EmployeeFormDialog({ employee }: { employee?: Profile }) {
  const isEdit = Boolean(employee);
  const action = isEdit ? updateEmployee.bind(null, employee!.id) : createEmployee;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PositionType | "">(employee?.position ?? "");
  const [allowanceType, setAllowanceType] = useState<AllowanceType>(
    employee?.allowance_type ?? "fixed_monthly",
  );
  const [allowanceRate, setAllowanceRate] = useState<number>(employee?.allowance_rate ?? 0);

  function handlePositionChange(value: string | null) {
    const nextPosition = (value ?? "") as PositionType;
    setPosition(nextPosition);
    const suggestion = suggestAllowance(nextPosition);
    setAllowanceType(suggestion.allowanceType);
    setAllowanceRate(suggestion.allowanceRate);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close dialog once the server action reports success
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={isEdit ? "outline" : "default"} size={isEdit ? "sm" : "default"}>
            {isEdit ? "Sửa" : "+ Thêm nhân viên"}
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa thông tin nhân viên" : "Thêm nhân viên mới"}</DialogTitle>
          <DialogDescription>
            Phụ cấp được tự động đề xuất theo vị trí công việc, bạn có thể chỉnh lại nếu cần.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col gap-2">
            <Label htmlFor="full_name">Họ tên</Label>
            <Input id="full_name" name="full_name" defaultValue={employee?.full_name} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" name="phone" defaultValue={employee?.phone ?? ""} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email (không bắt buộc)</Label>
            <Input id="email" name="email" type="email" defaultValue={employee?.email ?? ""} />
          </div>
          {!isEdit && (
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="password">Mật khẩu ban đầu</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="position">Vị trí công việc</Label>
            <Select name="position" value={position} onValueChange={handlePositionChange} required>
              <SelectTrigger id="position">
                <SelectValue placeholder="Chọn vị trí" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(POSITION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="hourly_wage">Lương cơ bản/giờ (VNĐ)</Label>
            <Input
              id="hourly_wage"
              name="hourly_wage"
              type="number"
              min={0}
              defaultValue={employee?.hourly_wage ?? 25000}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="allowance_type">Hình thức phụ cấp</Label>
            <Select
              name="allowance_type"
              value={allowanceType}
              onValueChange={(v) => setAllowanceType(v as AllowanceType)}
            >
              <SelectTrigger id="allowance_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_shift">Theo ca làm</SelectItem>
                <SelectItem value="fixed_monthly">Cố định hàng tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="allowance_rate">Mức phụ cấp (VNĐ)</Label>
            <Input
              id="allowance_rate"
              name="allowance_rate"
              type="number"
              min={0}
              value={allowanceRate}
              onChange={(e) => setAllowanceRate(Number(e.target.value))}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <Label htmlFor="bank_account_number">Số tài khoản ngân hàng</Label>
            <Input
              id="bank_account_number"
              name="bank_account_number"
              defaultValue={employee?.bank_account_number ?? ""}
            />
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
