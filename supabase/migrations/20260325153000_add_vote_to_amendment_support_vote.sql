alter table public.amendment_support_vote
add column if not exists vote integer;

update public.amendment_support_vote
set vote = 1
where vote is null;