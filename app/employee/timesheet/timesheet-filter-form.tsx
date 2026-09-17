"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function TimesheetFilterForm({
  defaultFrom,
  defaultTo,
}: {
  defaultFrom: string;
  defaultTo: string;
}) {
  return (
    <form className="flex flex-wrap items-end gap-4 rounded-lg border p-4" method="get">
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
