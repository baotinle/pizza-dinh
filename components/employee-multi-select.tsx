"use client";

import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Profile } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

export function EmployeeMultiSelect({
  employees,
  defaultEmployeeIds,
}: {
  employees: Profile[];
  defaultEmployeeIds: string[];
}) {
  const [selectedIds, setSelectedIds] = useState(defaultEmployeeIds);
  const [isAll, setIsAll] = useState(defaultEmployeeIds.length === 0);
  const [search, setSearch] = useState("");

  const filteredEmployees = employees.filter((employee) =>
    employee.full_name.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")),
  );
  const selectedNames = employees
    .filter((employee) => selectedIds.includes(employee.id))
    .map((employee) => employee.full_name);
  const triggerLabel = isAll
    ? "Tất cả nhân viên"
    : selectedNames.length === 1
      ? selectedNames[0]
      : `${selectedNames.length} nhân viên`;

  function selectAll() {
    setIsAll(true);
    setSelectedIds([]);
  }

  function toggleEmployee(employeeId: string) {
    setSelectedIds((current) => {
      const next = current.includes(employeeId)
        ? current.filter((id) => id !== employeeId)
        : [...current, employeeId];
      setIsAll(next.length === 0);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-8 items-center">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                id="employee"
                type="button"
                variant="outline"
                className="w-56 justify-between font-normal"
                aria-label="Chọn nhân viên"
              />
            }
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="size-4 opacity-60" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-0">
            <div className="border-b p-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
                <input
                  type="checkbox"
                  checked={isAll}
                  onChange={selectAll}
                  className="size-4 accent-primary"
                />
                <span className="font-medium">Tất cả nhân viên</span>
              </label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm kiếm"
                  aria-label="Tìm kiếm nhân viên"
                  className="pl-8"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-2">
              {filteredEmployees.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">Không tìm thấy nhân viên</p>
              ) : (
                filteredEmployees.map((employee) => {
                  const checked = !isAll && selectedIds.includes(employee.id);
                  return (
                    <label
                      key={employee.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border",
                          checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
                        )}
                      >
                        {checked && <Check className="size-3" />}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEmployee(employee.id)}
                        className="sr-only"
                      />
                      <span className="truncate">{employee.full_name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {isAll ? (
        <input type="hidden" name="employee" value="all" />
      ) : (
        selectedIds.map((employeeId) => (
          <input key={employeeId} type="hidden" name="employee" value={employeeId} />
        ))
      )}
    </div>
  );
}