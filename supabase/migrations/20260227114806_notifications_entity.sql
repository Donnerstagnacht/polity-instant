
  create table "public"."notification_read" (
    "id" uuid not null default gen_random_uuid(),
    "notification_id" uuid not null,
    "entity_type" text not null,
    "entity_id" uuid not null,
    "read_by_user_id" uuid,
    "read_at" timestamp with time zone not null default now()
      );


alter table "public"."notification_read" enable row level security;

alter table "public"."notification" add column "category" text;

CREATE INDEX idx_notification_category ON public.notification USING btree (category);

CREATE INDEX idx_notification_read_entity ON public.notification_read USING btree (entity_type, entity_id);

CREATE INDEX idx_notification_recipient_entity ON public.notification USING btree (recipient_entity_id, created_at);

CREATE INDEX idx_notification_recipient_group ON public.notification USING btree (recipient_group_id, created_at);

CREATE INDEX idx_notification_recipient_read ON public.notification USING btree (recipient_id, is_read);

CREATE UNIQUE INDEX notification_read_notification_id_entity_type_entity_id_key ON public.notification_read USING btree (notification_id, entity_type, entity_id);

CREATE UNIQUE INDEX notification_read_pkey ON public.notification_read USING btree (id);

alter table "public"."notification_read" add constraint "notification_read_pkey" PRIMARY KEY using index "notification_read_pkey";

alter table "public"."notification_read" add constraint "notification_read_notification_id_entity_type_entity_id_key" UNIQUE using index "notification_read_notification_id_entity_type_entity_id_key";

alter table "public"."notification_read" add constraint "notification_read_notification_id_fkey" FOREIGN KEY (notification_id) REFERENCES public.notification(id) ON DELETE CASCADE not valid;

alter table "public"."notification_read" validate constraint "notification_read_notification_id_fkey";

alter table "public"."notification_read" add constraint "notification_read_read_by_user_id_fkey" FOREIGN KEY (read_by_user_id) REFERENCES public."user"(id) ON DELETE SET NULL not valid;

alter table "public"."notification_read" validate constraint "notification_read_read_by_user_id_fkey";

grant delete on table "public"."notification_read" to "anon";

grant insert on table "public"."notification_read" to "anon";

grant references on table "public"."notification_read" to "anon";

grant select on table "public"."notification_read" to "anon";

grant trigger on table "public"."notification_read" to "anon";

grant truncate on table "public"."notification_read" to "anon";

grant update on table "public"."notification_read" to "anon";

grant delete on table "public"."notification_read" to "authenticated";

grant insert on table "public"."notification_read" to "authenticated";

grant references on table "public"."notification_read" to "authenticated";

grant select on table "public"."notification_read" to "authenticated";

grant trigger on table "public"."notification_read" to "authenticated";

grant truncate on table "public"."notification_read" to "authenticated";

grant update on table "public"."notification_read" to "authenticated";

grant delete on table "public"."notification_read" to "service_role";

grant insert on table "public"."notification_read" to "service_role";

grant references on table "public"."notification_read" to "service_role";

grant select on table "public"."notification_read" to "service_role";

grant trigger on table "public"."notification_read" to "service_role";

grant truncate on table "public"."notification_read" to "service_role";

grant update on table "public"."notification_read" to "service_role";


  create policy "service_role_all"
  on "public"."notification_read"
  as permissive
  for all
  to service_role
using (true);



