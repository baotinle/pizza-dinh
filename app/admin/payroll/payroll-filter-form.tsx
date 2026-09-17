"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile } from "@/lib/types/domain";

export function PayrollFilterForm({
  employees,
  defaultFrom,
  defaultTo,
  defaultEmployeeId,
}: {
  employees: Profile[];
  defaultFrom: string;
  defaultTo: string;
  defaultEmployeeId: string;
}) {
  return (
    <form className="flex flex-wrap items-end gap-4 rounded-lg border p-4" method="get">
      <div className="flex flex-col gap-2">
        <Label htmlFor="employee">Nhân viên</Label>
        <Select name="employee" defaultValue={defaultEmployeeId}>
          <SelectTrigger id="employee" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="from">Từ ngày</Label>
        <Input id="from" name="from" type="date" defaultValue={defaultFrom} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="to">Đến ngày</Label>
        <Input id="to" name="to" type="date" defaultValue={defaultTo} />
      </div>
      <Button type="submit">Lọc</Button>
    </form>
  );
}
