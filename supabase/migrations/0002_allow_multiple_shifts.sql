-- Allow an employee to have more than one shift (check-in/check-out pair) per day.
alter table attendance drop constraint if exists attendance_employee_id_work_date_key;

create index if not exists attendance_employee_work_date_idx on attendance (employee_id, work_date);
