import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import type { Announcement } from "@/lib/types/domain";
import { AnnouncementForm } from "./announcement-form";

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  const announcements = (data ?? []) as Announcement[];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Bảng tin thông báo</h1>
        <p className="text-sm text-muted-foreground">
          Gửi thông báo nội bộ đến toàn bộ nhân viên.
        </p>
      </div>

      <AnnouncementForm />

      <div className="flex flex-col gap-3">
        {announcements.map((a) => (
          <div key={a.id} className="flex flex-col gap-1 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Badge variant={a.priority === "urgent" ? "destructive" : "secondary"}>
                {a.priority === "urgent" ? "Khẩn cấp" : "Thường"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(a.created_at).toLocaleString("vi-VN")}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm">{a.content}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="text-muted-foreground">Chưa có thông báo nào.</p>
        )}
      </div>
    </div>
  );
}
