"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAnnouncement, type AnnouncementFormState } from "./actions";

const initialState: AnnouncementFormState = { error: null, success: false };

export function AnnouncementForm() {
  const [state, formAction, isPending] = useActionState(createAnnouncement, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="content">Nội dung thông báo</Label>
        <Textarea id="content" name="content" required rows={4} />
      </div>
      <div className="flex flex-col gap-2 sm:w-48">
        <Label htmlFor="priority">Mức độ ưu tiên</Label>
        <Select name="priority" defaultValue="normal">
          <SelectTrigger id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Thường</SelectItem>
            <SelectItem value="urgent">Khẩn cấp</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Đang đăng..." : "Đăng thông báo"}
      </Button>
    </form>
  );
}
