insert into trust_settings (key, value)
values
  ('trust_profile', '{"name":"AK Trust","founded_on":"2024-10-05","member_count":21,"monthly_contribution":300,"reporting_date":"2026-10-10","opening_balance":89500,"currency":"INR","timezone":"Asia/Kolkata"}'),
  ('fundraising_cycle', '{"fundraising_year":2026,"monthly_member_contribution":300,"target_total":6300}')
  on conflict (key) do update set value = excluded.value;

insert into opening_balances (id, amount, effective_date, description, status)
values (
  gen_random_uuid(),
  89500,
  '2026-10-10',
  'Reported historical opening balance pending reconciliation with actual records.',
  'active'
)
on conflict do nothing;

insert into fundraising_cycles (id, fundraising_year, monthly_member_contribution, start_date, end_date, is_active)
values (
  gen_random_uuid(),
  2026,
  300,
  '2026-01-01',
  '2026-12-31',
  true
)
on conflict do nothing;

-- Do not create member names, donor records, or disbursement records automatically.
-- Register actual members and transactions through the admin workflow.
