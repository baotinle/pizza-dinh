import Link from "next/link";
import { FinancialDashboard } from "./financial-dashboard";

export default async function AdminHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">Chào mừng trở lại, Pizza Đình.</p>
      </div>
      <FinancialDashboard />
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
