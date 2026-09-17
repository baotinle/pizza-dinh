"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

export function ScheduleUploadDialog() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;
    const startDate = String(formData.get("start_date") ?? "");
    const endDate = String(formData.get("end_date") ?? "");
    const note = String(formData.get("note") ?? "").trim();

    if (!file || file.size === 0) {
      setError("Vui lòng chọn ảnh lịch làm việc.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Vui lòng chọn ngày bắt đầu và kết thúc áp dụng.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const path = `schedules/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("schedules")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setIsSubmitting(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("schedule_postings").insert({
      image_path: path,
      start_date: startDate,
      end_date: endDate,
      note: note || null,
      created_by: user?.id,
    });

    setIsSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setOpen(false);
    formRef.current?.reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Tải ảnh mới lên</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đăng lịch làm việc mới</DialogTitle>
          <DialogDescription>
            Chọn ảnh lịch làm và khoảng thời gian áp dụng cho tuần làm việc.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="image">File ảnh lịch làm việc</Label>
            <Input id="image" name="image" type="file" accept="image/*" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start_date">Ngày bắt đầu áp dụng</Label>
              <Input id="start_date" name="start_date" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end_date">Ngày kết thúc áp dụng</Label>
              <Input id="end_date" name="end_date" type="date" required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Ghi chú bổ sung (không bắt buộc)</Label>
            <Textarea id="note" name="note" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tải lên..." : "Đăng lịch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
