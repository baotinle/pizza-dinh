import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/employees", label: "Nhân sự & Lương" },
  { href: "/admin/schedules", label: "Lịch làm việc" },
  { href: "/admin/attendance", label: "Chấm công" },
  { href: "/admin/announcements", label: "Thông báo" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r bg-muted/30 p-4">
        <div className="mb-6">
          <p className="text-lg font-semibold">Pizza Đình</p>
          <p className="text-sm text-muted-foreground">Xin chào, {profile.full_name}</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-auto">
          <Button type="submit" variant="outline" className="w-full">
            Đăng xuất
          </Button>
        </form>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
