import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { POSITION_LABELS, type Profile } from "@/lib/types/domain";
import { EmployeeFormDialog } from "./employee-form-dialog";
import { EmployeeActiveToggle } from "./employee-active-toggle";
import { EmployeeDeleteButton } from "./employee-delete-button";

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "employee")
    .order("full_name");

  const rows = (employees ?? []) as Profile[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Nhân sự & Tính lương</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin nhân viên và mức phụ cấp theo vị trí.
          </p>
        </div>
        <EmployeeFormDialog />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead>Lương/giờ</TableHead>
              <TableHead>Phụ cấp</TableHead>
              <TableHead>Số TK ngân hàng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.full_name}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>{employee.position ? POSITION_LABELS[employee.position] : "-"}</TableCell>
                <TableCell>{employee.hourly_wage.toLocaleString("vi-VN")} đ</TableCell>
                <TableCell>
                  {employee.allowance_rate.toLocaleString("vi-VN")} đ /{" "}
                  {employee.allowance_type === "per_shift" ? "ca" : "tháng"}
                </TableCell>
                <TableCell>{employee.bank_account_number ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={employee.is_active ? "default" : "secondary"}>
                    {employee.is_active ? "Đang làm" : "Ngừng làm"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <EmployeeFormDialog employee={employee} />
                  <EmployeeActiveToggle employeeId={employee.id} isActive={employee.is_active} />
                  <EmployeeDeleteButton employeeId={employee.id} employeeName={employee.full_name} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Chưa có nhân viên nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
