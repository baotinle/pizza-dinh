import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { formatDateVn } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Announcement, Attendance, SchedulePosting } from "@/lib/types/domain";
import { CheckInOutCard } from "./check-in-out-card";
import { ScheduleImageZoom } from "./schedule-image-zoom";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function EmployeeDashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: schedule }, { data: announcementsData }, { data: todayAttendance }] =
    await Promise.all([
      supabase
        .from("schedule_postings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", profile.id)
        .eq("work_date", todayIso())
        .maybeSingle(),
    ]);

  const latestSchedule = schedule as SchedulePosting | null;
  const announcements = (announcementsData ?? []) as Announcement[];
  const today = todayAttendance as Attendance | null;

  const scheduleUrl = latestSchedule
    ? supabase.storage.from("schedules").getPublicUrl(latestSchedule.image_path).data.publicUrl
    : null;

  return (
    <div className="flex flex-col gap-6">
      <CheckInOutCard
        checkInTime={today?.check_in_time ?? null}
        checkOutTime={today?.check_out_time ?? null}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lịch làm việc mới nhất</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {latestSchedule && scheduleUrl ? (
            <>
              <p className="text-sm font-medium">
                Áp dụng từ ngày {formatDateVn(latestSchedule.start_date)} đến{" "}
                {formatDateVn(latestSchedule.end_date)}
              </p>
              {latestSchedule.note && (
                <p className="text-sm text-muted-foreground">{latestSchedule.note}</p>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={scheduleUrl} alt="Lịch làm việc" className="max-h-96 rounded-md border object-contain" />
              <ScheduleImageZoom src={scheduleUrl} />
            </>
          ) : (
            <p className="text-muted-foreground">Chưa có lịch làm việc nào được đăng.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bảng tin thông báo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {announcements.map((a) => (
            <div key={a.id} className="flex flex-col gap-1 rounded-md border p-3">
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
        </CardContent>
      </Card>
    </div>
  );
}
