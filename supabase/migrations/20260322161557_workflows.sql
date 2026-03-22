
  create table "public"."group_workflow" (
    "id" uuid not null default gen_random_uuid(),
    "group_id" uuid not null,
    "name" text,
    "description" text,
    "status" text,
    "created_by_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."group_workflow" enable row level security;


  create table "public"."group_workflow_step" (
    "id" uuid not null default gen_random_uuid(),
    "workflow_id" uuid not null,
    "group_id" uuid not null,
    "order_index" integer not null default 0,
    "label" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."group_workflow_step" enable row level security;

alter table "public"."amendment_path" add column "workflow_id" uuid;

CREATE UNIQUE INDEX group_workflow_pkey ON public.group_workflow USING btree (id);

CREATE UNIQUE INDEX group_workflow_step_pkey ON public.group_workflow_step USING btree (id);

CREATE INDEX idx_group_workflow_created_by ON public.group_workflow USING btree (created_by_id);

CREATE INDEX idx_group_workflow_group ON public.group_workflow USING btree (group_id);

CREATE INDEX idx_group_workflow_step_group ON public.group_workflow_step USING btree (group_id);

CREATE INDEX idx_group_workflow_step_workflow ON public.group_workflow_step USING btree (workflow_id);

alter table "public"."group_workflow" add constraint "group_workflow_pkey" PRIMARY KEY using index "group_workflow_pkey";

alter table "public"."group_workflow_step" add constraint "group_workflow_step_pkey" PRIMARY KEY using index "group_workflow_step_pkey";

alter table "public"."amendment_path" add constraint "amendment_path_workflow_id_fkey" FOREIGN KEY (workflow_id) REFERENCES public.group_workflow(id) ON DELETE SET NULL not valid;

alter table "public"."amendment_path" validate constraint "amendment_path_workflow_id_fkey";

alter table "public"."group_workflow" add constraint "group_workflow_created_by_id_fkey" FOREIGN KEY (created_by_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."group_workflow" validate constraint "group_workflow_created_by_id_fkey";

alter table "public"."group_workflow" add constraint "group_workflow_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."group_workflow" validate constraint "group_workflow_group_id_fkey";

alter table "public"."group_workflow_step" add constraint "group_workflow_step_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."group_workflow_step" validate constraint "group_workflow_step_group_id_fkey";

alter table "public"."group_workflow_step" add constraint "group_workflow_step_workflow_id_fkey" FOREIGN KEY (workflow_id) REFERENCES public.group_workflow(id) ON DELETE CASCADE not valid;

alter table "public"."group_workflow_step" validate constraint "group_workflow_step_workflow_id_fkey";

grant delete on table "public"."group_workflow" to "anon";

grant insert on table "public"."group_workflow" to "anon";

grant references on table "public"."group_workflow" to "anon";

grant select on table "public"."group_workflow" to "anon";

grant trigger on table "public"."group_workflow" to "anon";

grant truncate on table "public"."group_workflow" to "anon";

grant update on table "public"."group_workflow" to "anon";

grant delete on table "public"."group_workflow" to "authenticated";

grant insert on table "public"."group_workflow" to "authenticated";

grant references on table "public"."group_workflow" to "authenticated";

grant select on table "public"."group_workflow" to "authenticated";

grant trigger on table "public"."group_workflow" to "authenticated";

grant truncate on table "public"."group_workflow" to "authenticated";

grant update on table "public"."group_workflow" to "authenticated";

grant delete on table "public"."group_workflow" to "service_role";

grant insert on table "public"."group_workflow" to "service_role";

grant references on table "public"."group_workflow" to "service_role";

grant select on table "public"."group_workflow" to "service_role";

grant trigger on table "public"."group_workflow" to "service_role";

grant truncate on table "public"."group_workflow" to "service_role";

grant update on table "public"."group_workflow" to "service_role";

grant delete on table "public"."group_workflow_step" to "anon";

grant insert on table "public"."group_workflow_step" to "anon";

grant references on table "public"."group_workflow_step" to "anon";

grant select on table "public"."group_workflow_step" to "anon";

grant trigger on table "public"."group_workflow_step" to "anon";

grant truncate on table "public"."group_workflow_step" to "anon";

grant update on table "public"."group_workflow_step" to "anon";

grant delete on table "public"."group_workflow_step" to "authenticated";

grant insert on table "public"."group_workflow_step" to "authenticated";

grant references on table "public"."group_workflow_step" to "authenticated";

grant select on table "public"."group_workflow_step" to "authenticated";

grant trigger on table "public"."group_workflow_step" to "authenticated";

grant truncate on table "public"."group_workflow_step" to "authenticated";

grant update on table "public"."group_workflow_step" to "authenticated";

grant delete on table "public"."group_workflow_step" to "service_role";

grant insert on table "public"."group_workflow_step" to "service_role";

grant references on table "public"."group_workflow_step" to "service_role";

grant select on table "public"."group_workflow_step" to "service_role";

grant trigger on table "public"."group_workflow_step" to "service_role";

grant truncate on table "public"."group_workflow_step" to "service_role";

grant update on table "public"."group_workflow_step" to "service_role";


  create policy "service_role_all"
  on "public"."group_workflow"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."group_workflow_step"
  as permissive
  for all
  to service_role
using (true);



