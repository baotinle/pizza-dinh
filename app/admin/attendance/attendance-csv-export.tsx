"use client";

import { Button } from "@/components/ui/button";
import { formatTimeVn } from "@/lib/date";
import {
  ATTENDANCE_STATUS_LABELS,
  type Attendance,
  type AttendanceStatus,
} from "@/lib/types/domain";

function csvCell(value: string | number | null) {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function createAttendanceCsv(rows: Attendance[], employeeMap: Record<string, string>) {
  const header = ["Ngày", "Nhân viên", "Trạng thái", "Giờ vào", "Giờ ra", "Ghi chú"];
  const lines = rows.map((row) => [
    row.work_date,
    employeeMap[row.employee_id] ?? "-",
    ATTENDANCE_STATUS_LABELS[row.status as AttendanceStatus],
    row.check_in_time ? formatTimeVn(row.check_in_time) : "-",
    row.check_out_time ? formatTimeVn(row.check_out_time) : "-",
    row.note ?? "",
  ]);

  return [header, ...lines].map((line) => line.map(csvCell).join(",")).join("\r\n");
}

export function AttendanceCsvExport({
  rows,
  employeeMap,
  from,
  to,
}: {
  rows: Attendance[];
  employeeMap: Record<string, string>;
  from: string;
  to: string;
}) {
  function downloadCsv() {
    const csv = createAttendanceCsv(rows, employeeMap);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cham-cong_${from}_${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" disabled={rows.length === 0} onClick={downloadCsv}>
      Xuất CSV
    </Button>
  );
}
