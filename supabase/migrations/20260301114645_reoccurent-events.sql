
  create table "public"."calendar_subscription" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "target_type" text not null,
    "target_group_id" uuid,
    "target_user_id" uuid,
    "is_visible" boolean not null default true,
    "color" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."calendar_subscription" enable row level security;


  create table "public"."event_exception" (
    "id" uuid not null default gen_random_uuid(),
    "parent_event_id" uuid not null,
    "original_date" timestamp with time zone not null,
    "action" text not null,
    "new_title" text,
    "new_description" text,
    "new_start_date" timestamp with time zone,
    "new_end_date" timestamp with time zone,
    "new_location_name" text,
    "new_location_address" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."event_exception" enable row level security;

alter table "public"."event" add column "recurrence_days" integer[];

alter table "public"."event" add column "recurrence_interval" integer default 1;

alter table "public"."event" add column "recurrence_rule" text;

CREATE UNIQUE INDEX calendar_subscription_pkey ON public.calendar_subscription USING btree (id);

CREATE UNIQUE INDEX event_exception_pkey ON public.event_exception USING btree (id);

CREATE INDEX idx_calendar_sub_user ON public.calendar_subscription USING btree (user_id);

CREATE UNIQUE INDEX idx_calendar_sub_user_group ON public.calendar_subscription USING btree (user_id, target_group_id) WHERE (target_group_id IS NOT NULL);

CREATE UNIQUE INDEX idx_calendar_sub_user_user ON public.calendar_subscription USING btree (user_id, target_user_id) WHERE (target_user_id IS NOT NULL);

CREATE INDEX idx_event_exception_parent ON public.event_exception USING btree (parent_event_id);

CREATE UNIQUE INDEX uq_event_exception_parent_date ON public.event_exception USING btree (parent_event_id, original_date);

alter table "public"."calendar_subscription" add constraint "calendar_subscription_pkey" PRIMARY KEY using index "calendar_subscription_pkey";

alter table "public"."event_exception" add constraint "event_exception_pkey" PRIMARY KEY using index "event_exception_pkey";

alter table "public"."calendar_subscription" add constraint "calendar_subscription_target_group_id_fkey" FOREIGN KEY (target_group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."calendar_subscription" validate constraint "calendar_subscription_target_group_id_fkey";

alter table "public"."calendar_subscription" add constraint "calendar_subscription_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."calendar_subscription" validate constraint "calendar_subscription_target_user_id_fkey";

alter table "public"."calendar_subscription" add constraint "calendar_subscription_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."calendar_subscription" validate constraint "calendar_subscription_user_id_fkey";

alter table "public"."calendar_subscription" add constraint "chk_calendar_sub_target" CHECK ((((target_type = 'group'::text) AND (target_group_id IS NOT NULL) AND (target_user_id IS NULL)) OR ((target_type = 'user'::text) AND (target_user_id IS NOT NULL) AND (target_group_id IS NULL)))) not valid;

alter table "public"."calendar_subscription" validate constraint "chk_calendar_sub_target";

alter table "public"."event_exception" add constraint "event_exception_parent_event_id_fkey" FOREIGN KEY (parent_event_id) REFERENCES public.event(id) ON DELETE CASCADE not valid;

alter table "public"."event_exception" validate constraint "event_exception_parent_event_id_fkey";

alter table "public"."event_exception" add constraint "uq_event_exception_parent_date" UNIQUE using index "uq_event_exception_parent_date";

grant delete on table "public"."calendar_subscription" to "anon";

grant insert on table "public"."calendar_subscription" to "anon";

grant references on table "public"."calendar_subscription" to "anon";

grant select on table "public"."calendar_subscription" to "anon";

grant trigger on table "public"."calendar_subscription" to "anon";

grant truncate on table "public"."calendar_subscription" to "anon";

grant update on table "public"."calendar_subscription" to "anon";

grant delete on table "public"."calendar_subscription" to "authenticated";

grant insert on table "public"."calendar_subscription" to "authenticated";

grant references on table "public"."calendar_subscription" to "authenticated";

grant select on table "public"."calendar_subscription" to "authenticated";

grant trigger on table "public"."calendar_subscription" to "authenticated";

grant truncate on table "public"."calendar_subscription" to "authenticated";

grant update on table "public"."calendar_subscription" to "authenticated";

grant delete on table "public"."calendar_subscription" to "service_role";

grant insert on table "public"."calendar_subscription" to "service_role";

grant references on table "public"."calendar_subscription" to "service_role";

grant select on table "public"."calendar_subscription" to "service_role";

grant trigger on table "public"."calendar_subscription" to "service_role";

grant truncate on table "public"."calendar_subscription" to "service_role";

grant update on table "public"."calendar_subscription" to "service_role";

grant delete on table "public"."event_exception" to "anon";

grant insert on table "public"."event_exception" to "anon";

grant references on table "public"."event_exception" to "anon";

grant select on table "public"."event_exception" to "anon";

grant trigger on table "public"."event_exception" to "anon";

grant truncate on table "public"."event_exception" to "anon";

grant update on table "public"."event_exception" to "anon";

grant delete on table "public"."event_exception" to "authenticated";

grant insert on table "public"."event_exception" to "authenticated";

grant references on table "public"."event_exception" to "authenticated";

grant select on table "public"."event_exception" to "authenticated";

grant trigger on table "public"."event_exception" to "authenticated";

grant truncate on table "public"."event_exception" to "authenticated";

grant update on table "public"."event_exception" to "authenticated";

grant delete on table "public"."event_exception" to "service_role";

grant insert on table "public"."event_exception" to "service_role";

grant references on table "public"."event_exception" to "service_role";

grant select on table "public"."event_exception" to "service_role";

grant trigger on table "public"."event_exception" to "service_role";

grant truncate on table "public"."event_exception" to "service_role";

grant update on table "public"."event_exception" to "service_role";


  create policy "service_role_all"
  on "public"."calendar_subscription"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."event_exception"
  as permissive
  for all
  to service_role
using (true);



