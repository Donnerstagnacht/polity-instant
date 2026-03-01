alter table "public"."group" add column "group_type" text not null default 'base'::text;

alter table "public"."group_membership" add column "source" text not null default 'direct'::text;

alter table "public"."group_membership" add column "source_group_id" uuid;

CREATE UNIQUE INDEX group_membership_user_id_group_id_key ON public.group_membership USING btree (user_id, group_id);

CREATE INDEX idx_group_membership_source_group ON public.group_membership USING btree (source_group_id);

alter table "public"."group_membership" add constraint "group_membership_source_group_id_fkey" FOREIGN KEY (source_group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."group_membership" validate constraint "group_membership_source_group_id_fkey";

alter table "public"."group_membership" add constraint "group_membership_user_id_group_id_key" UNIQUE using index "group_membership_user_id_group_id_key";


