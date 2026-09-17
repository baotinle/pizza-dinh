import { createClient } from "@/lib/supabase/server";
import type { SchedulePosting } from "@/lib/types/domain";
import { ScheduleUploadDialog } from "./schedule-upload-dialog";
import { DeleteScheduleButton } from "./delete-schedule-button";
import { formatDateVn } from "@/lib/date";

export default async function SchedulesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("schedule_postings")
    .select("*")
    .order("created_at", { ascending: false });

  const postings = (data ?? []) as SchedulePosting[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Lịch làm việc</h1>
          <p className="text-sm text-muted-foreground">
            Đăng ảnh lịch làm việc kèm khoảng thời gian áp dụng.
          </p>
        </div>
        <ScheduleUploadDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {postings.map((posting) => {
          const {
            data: { publicUrl },
          } = supabase.storage.from("schedules").getPublicUrl(posting.image_path);
          return (
            <div key={posting.id} className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={publicUrl} alt="Lịch làm việc" className="h-full w-full object-cover" />
              </div>
              <p className="text-sm font-medium">
                Áp dụng từ {formatDateVn(posting.start_date)} đến {formatDateVn(posting.end_date)}
              </p>
              {posting.note && <p className="text-sm text-muted-foreground">{posting.note}</p>}
              <DeleteScheduleButton id={posting.id} imagePath={posting.image_path} />
            </div>
          );
        })}
        {postings.length === 0 && (
          <p className="text-muted-foreground">Chưa có lịch làm việc nào được đăng.</p>
        )}
      </div>
    </div>
  );
}
