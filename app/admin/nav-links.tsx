"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, Clock, Banknote, Megaphone, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan & Thống kê", icon: LayoutDashboard },
  { href: "/admin/employees", label: "Nhân sự & Lương", icon: Users },
  { href: "/admin/schedules", label: "Lịch làm việc", icon: CalendarDays },
  { href: "/admin/attendance", label: "Chấm công & Quản lý Ca", icon: Clock },
  { href: "/admin/payroll", label: "Bảng lương", icon: Banknote },
  { href: "/admin/announcements", label: "Bảng tin Thông báo", icon: Megaphone },
];

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="icon" aria-label="Mở menu admin" />}>
        <Menu />
      </DialogTrigger>
      <DialogContent className="left-4 top-4 max-w-[calc(100%-2rem)] translate-x-0 translate-y-0 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Menu quản trị</DialogTitle>
        </DialogHeader>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
