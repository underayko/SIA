alter table if exists public.area_submission_criterion_scores
  add column if not exists capped_score numeric(10, 2) null,
  add column if not exists excess_score numeric(10, 2) null;