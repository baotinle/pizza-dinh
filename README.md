This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Pizza Đình — Internal Ops App

Nội bộ quản lý nhân sự, lịch làm việc, chấm công, lương và thông báo cho cửa hàng Pizza Đình.

### 1. Tạo project Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com).
2. Vào **SQL Editor**, chạy toàn bộ nội dung file [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql). Lệnh này tạo bảng, RLS policy, và bucket Storage `schedules`.
3. Vào **Project Settings → API**, lấy `Project URL`, `anon public key`, `service_role key`.

### 2. Cấu hình biến môi trường

Sao chép `.env.local.example` thành `.env.local` và điền giá trị lấy ở bước trên:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
QR_CHECK_IN_TOKEN=...
QR_CHECK_OUT_TOKEN=...
```

`SUPABASE_SERVICE_ROLE_KEY` chỉ được dùng ở server (server actions), không bao giờ lộ ra client.
Hai token QR cũng chỉ được lưu ở biến môi trường server. Admin mở **Chấm công & Quản lý Ca → Mã QR chấm công** để hiển thị/in hai mã cố định.

Khi nhân viên bấm **Check-in** hoặc **Check-out**, trình duyệt sẽ yêu cầu quyền camera để quét đúng mã tương ứng. Camera hoạt động trên `localhost` hoặc HTTPS.

### 3. Tạo tài khoản Admin đầu tiên

Vì đăng ký nhân viên chỉ do Admin thực hiện trong app, tài khoản Admin đầu tiên cần tạo thủ công:

1. Vào **Authentication → Users** trên Supabase Dashboard, bấm "Add user", nhập email + mật khẩu, tick "Auto confirm user".
2. Vào **SQL Editor**, chạy (thay `<user-id>` bằng UUID vừa tạo):

```sql
insert into profiles (id, full_name, email, role, hourly_wage, allowance_type, allowance_rate)
values ('<user-id>', 'Chủ cửa hàng', '<email-đã-tạo>', 'admin', 0, 'fixed_monthly', 0);
```

### 4. Chạy dự án

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000), đăng nhập bằng tài khoản Admin vừa tạo.

### 5. Deploy lên Vercel

Import repo vào Vercel, khai báo 3 biến môi trường ở trên trong Project Settings → Environment Variables, rồi deploy.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

