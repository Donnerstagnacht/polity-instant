
  create table "public"."user_preference" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "create_form_style" text not null default 'carousel'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."user_preference" enable row level security;

CREATE INDEX idx_user_preference_user ON public.user_preference USING btree (user_id);

CREATE UNIQUE INDEX user_preference_pkey ON public.user_preference USING btree (id);

CREATE UNIQUE INDEX user_preference_user_id_key ON public.user_preference USING btree (user_id);

alter table "public"."user_preference" add constraint "user_preference_pkey" PRIMARY KEY using index "user_preference_pkey";

alter table "public"."user_preference" add constraint "user_preference_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."user_preference" validate constraint "user_preference_user_id_fkey";

alter table "public"."user_preference" add constraint "user_preference_user_id_key" UNIQUE using index "user_preference_user_id_key";

grant delete on table "public"."user_preference" to "anon";

grant insert on table "public"."user_preference" to "anon";

grant references on table "public"."user_preference" to "anon";

grant select on table "public"."user_preference" to "anon";

grant trigger on table "public"."user_preference" to "anon";

grant truncate on table "public"."user_preference" to "anon";

grant update on table "public"."user_preference" to "anon";

grant delete on table "public"."user_preference" to "authenticated";

grant insert on table "public"."user_preference" to "authenticated";

grant references on table "public"."user_preference" to "authenticated";

grant select on table "public"."user_preference" to "authenticated";

grant trigger on table "public"."user_preference" to "authenticated";

grant truncate on table "public"."user_preference" to "authenticated";

grant update on table "public"."user_preference" to "authenticated";

grant delete on table "public"."user_preference" to "service_role";

grant insert on table "public"."user_preference" to "service_role";

grant references on table "public"."user_preference" to "service_role";

grant select on table "public"."user_preference" to "service_role";

grant trigger on table "public"."user_preference" to "service_role";

grant truncate on table "public"."user_preference" to "service_role";

grant update on table "public"."user_preference" to "service_role";


  create policy "service_role_all"
  on "public"."user_preference"
  as permissive
  for all
  to service_role
using (true);



