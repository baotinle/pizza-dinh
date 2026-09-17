import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/employee", label: "Trang chính" },
  { href: "/employee/timesheet", label: "Bảng công của tôi" },
];

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div>
          <p className="font-semibold">Pizza Đình</p>
          <p className="text-sm text-muted-foreground">Xin chào, {profile.full_name}</p>
        </div>
        <nav className="flex items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Đăng xuất
            </Button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl p-4">{children}</main>
    </div>
  );
}
