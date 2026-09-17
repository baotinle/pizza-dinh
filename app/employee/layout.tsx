import Image from "next/image";
import { requireProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { EmployeeNavLinks } from "./nav-links";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Pizza Đình" width={32} height={32} className="size-8" />
          <div>
            <p className="font-semibold">Pizza Đình</p>
            <p className="text-xs text-muted-foreground">Xin chào, {profile.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EmployeeNavLinks />
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Đăng xuất
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4">{children}</main>
    </div>
  );
}
