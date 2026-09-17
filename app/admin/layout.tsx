import Image from "next/image";
import { requireProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { AdminNavLinks } from "./nav-links";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r bg-sidebar p-4">
        <div className="mb-6 flex items-center gap-2">
          <Image src="/logo.png" alt="Pizza Đình" width={36} height={36} className="size-9" />
          <div>
            <p className="text-lg font-semibold">Pizza Đình</p>
            <p className="text-xs text-muted-foreground">Xin chào, {profile.full_name}</p>
          </div>
        </div>
        <AdminNavLinks />
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

