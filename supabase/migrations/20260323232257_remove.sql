drop index if exists "public"."idx_amendment_status";

alter table "public"."amendment" drop column "status";

CREATE INDEX idx_amendment_editing_mode ON public.amendment USING btree (editing_mode);


