import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const { count: employeeCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "employee");
  const { count: announcementCount } = await supabase
    .from("announcements")
    .select("*", { count: "exact", head: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">Chào mừng trở lại, Pizza Đình.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Nhân viên</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{employeeCount ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Thông báo</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{announcementCount ?? 0}</CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="underline" href="/admin/employees">
          Quản lý nhân sự & lương
        </Link>
        <Link className="underline" href="/admin/schedules">
          Đăng lịch làm việc
        </Link>
        <Link className="underline" href="/admin/attendance">
          Bảng chấm công
        </Link>
        <Link className="underline" href="/admin/announcements">
          Bảng tin thông báo
        </Link>
      </div>
    </div>
  );
}
