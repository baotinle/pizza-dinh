alter table payroll_adjustments
  add column incident_date date;

update payroll_adjustments
set incident_date = period_start
where incident_date is null;

alter table payroll_adjustments
  alter column incident_date set not null;

create index payroll_adjustments_employee_incident_date_idx
  on payroll_adjustments (employee_id, incident_date);