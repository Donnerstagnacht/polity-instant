
  create table "public"."statement_hashtag" (
    "id" uuid not null default gen_random_uuid(),
    "statement_id" uuid not null,
    "hashtag_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."statement_hashtag" enable row level security;


  create table "public"."statement_support_vote" (
    "id" uuid not null default gen_random_uuid(),
    "statement_id" uuid not null,
    "user_id" uuid not null,
    "vote" integer,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."statement_support_vote" enable row level security;


  create table "public"."statement_survey" (
    "id" uuid not null default gen_random_uuid(),
    "statement_id" uuid not null,
    "question" text not null,
    "ends_at" timestamp with time zone not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."statement_survey" enable row level security;


  create table "public"."statement_survey_option" (
    "id" uuid not null default gen_random_uuid(),
    "survey_id" uuid not null,
    "label" text not null,
    "vote_count" integer not null default 0,
    "position" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."statement_survey_option" enable row level security;


  create table "public"."statement_survey_vote" (
    "id" uuid not null default gen_random_uuid(),
    "option_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."statement_survey_vote" enable row level security;

alter table "public"."statement" drop column "tag";

alter table "public"."statement" add column "comment_count" integer not null default 0;

alter table "public"."statement" add column "downvotes" integer not null default 0;

alter table "public"."statement" add column "group_id" uuid;

alter table "public"."statement" add column "image_url" text;

alter table "public"."statement" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."statement" add column "upvotes" integer not null default 0;

alter table "public"."statement" add column "video_url" text;

alter table "public"."thread" add column "statement_id" uuid;

alter table "public"."thread" alter column "document_id" drop not null;

CREATE INDEX idx_statement_group ON public.statement USING btree (group_id);

CREATE INDEX idx_statement_hashtag_hashtag ON public.statement_hashtag USING btree (hashtag_id);

CREATE INDEX idx_statement_hashtag_statement ON public.statement_hashtag USING btree (statement_id);

CREATE INDEX idx_statement_support_vote_statement ON public.statement_support_vote USING btree (statement_id);

CREATE INDEX idx_statement_support_vote_user ON public.statement_support_vote USING btree (user_id);

CREATE INDEX idx_statement_survey_option_survey ON public.statement_survey_option USING btree (survey_id);

CREATE INDEX idx_statement_survey_statement ON public.statement_survey USING btree (statement_id);

CREATE INDEX idx_statement_survey_vote_option ON public.statement_survey_vote USING btree (option_id);

CREATE INDEX idx_statement_survey_vote_user ON public.statement_survey_vote USING btree (user_id);

CREATE INDEX idx_thread_statement ON public.thread USING btree (statement_id);

CREATE UNIQUE INDEX statement_hashtag_pkey ON public.statement_hashtag USING btree (id);

CREATE UNIQUE INDEX statement_hashtag_statement_id_hashtag_id_key ON public.statement_hashtag USING btree (statement_id, hashtag_id);

CREATE UNIQUE INDEX statement_support_vote_pkey ON public.statement_support_vote USING btree (id);

CREATE UNIQUE INDEX statement_support_vote_statement_id_user_id_key ON public.statement_support_vote USING btree (statement_id, user_id);

CREATE UNIQUE INDEX statement_survey_option_pkey ON public.statement_survey_option USING btree (id);

CREATE UNIQUE INDEX statement_survey_pkey ON public.statement_survey USING btree (id);

CREATE UNIQUE INDEX statement_survey_statement_id_key ON public.statement_survey USING btree (statement_id);

CREATE UNIQUE INDEX statement_survey_vote_option_id_user_id_key ON public.statement_survey_vote USING btree (option_id, user_id);

CREATE UNIQUE INDEX statement_survey_vote_pkey ON public.statement_survey_vote USING btree (id);

alter table "public"."statement_hashtag" add constraint "statement_hashtag_pkey" PRIMARY KEY using index "statement_hashtag_pkey";

alter table "public"."statement_support_vote" add constraint "statement_support_vote_pkey" PRIMARY KEY using index "statement_support_vote_pkey";

alter table "public"."statement_survey" add constraint "statement_survey_pkey" PRIMARY KEY using index "statement_survey_pkey";

alter table "public"."statement_survey_option" add constraint "statement_survey_option_pkey" PRIMARY KEY using index "statement_survey_option_pkey";

alter table "public"."statement_survey_vote" add constraint "statement_survey_vote_pkey" PRIMARY KEY using index "statement_survey_vote_pkey";

alter table "public"."statement" add constraint "statement_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."group"(id) ON DELETE SET NULL not valid;

alter table "public"."statement" validate constraint "statement_group_id_fkey";

alter table "public"."statement_hashtag" add constraint "statement_hashtag_hashtag_id_fkey" FOREIGN KEY (hashtag_id) REFERENCES public.hashtag(id) ON DELETE CASCADE not valid;

alter table "public"."statement_hashtag" validate constraint "statement_hashtag_hashtag_id_fkey";

alter table "public"."statement_hashtag" add constraint "statement_hashtag_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES public.statement(id) ON DELETE CASCADE not valid;

alter table "public"."statement_hashtag" validate constraint "statement_hashtag_statement_id_fkey";

alter table "public"."statement_hashtag" add constraint "statement_hashtag_statement_id_hashtag_id_key" UNIQUE using index "statement_hashtag_statement_id_hashtag_id_key";

alter table "public"."statement_support_vote" add constraint "statement_support_vote_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES public.statement(id) ON DELETE CASCADE not valid;

alter table "public"."statement_support_vote" validate constraint "statement_support_vote_statement_id_fkey";

alter table "public"."statement_support_vote" add constraint "statement_support_vote_statement_id_user_id_key" UNIQUE using index "statement_support_vote_statement_id_user_id_key";

alter table "public"."statement_support_vote" add constraint "statement_support_vote_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."statement_support_vote" validate constraint "statement_support_vote_user_id_fkey";

alter table "public"."statement_survey" add constraint "statement_survey_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES public.statement(id) ON DELETE CASCADE not valid;

alter table "public"."statement_survey" validate constraint "statement_survey_statement_id_fkey";

alter table "public"."statement_survey" add constraint "statement_survey_statement_id_key" UNIQUE using index "statement_survey_statement_id_key";

alter table "public"."statement_survey_option" add constraint "statement_survey_option_survey_id_fkey" FOREIGN KEY (survey_id) REFERENCES public.statement_survey(id) ON DELETE CASCADE not valid;

alter table "public"."statement_survey_option" validate constraint "statement_survey_option_survey_id_fkey";

alter table "public"."statement_survey_vote" add constraint "statement_survey_vote_option_id_fkey" FOREIGN KEY (option_id) REFERENCES public.statement_survey_option(id) ON DELETE CASCADE not valid;

alter table "public"."statement_survey_vote" validate constraint "statement_survey_vote_option_id_fkey";

alter table "public"."statement_survey_vote" add constraint "statement_survey_vote_option_id_user_id_key" UNIQUE using index "statement_survey_vote_option_id_user_id_key";

alter table "public"."statement_survey_vote" add constraint "statement_survey_vote_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."statement_survey_vote" validate constraint "statement_survey_vote_user_id_fkey";

alter table "public"."thread" add constraint "thread_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES public.statement(id) ON DELETE CASCADE not valid;

alter table "public"."thread" validate constraint "thread_statement_id_fkey";

grant delete on table "public"."statement_hashtag" to "anon";

grant insert on table "public"."statement_hashtag" to "anon";

grant references on table "public"."statement_hashtag" to "anon";

grant select on table "public"."statement_hashtag" to "anon";

grant trigger on table "public"."statement_hashtag" to "anon";

grant truncate on table "public"."statement_hashtag" to "anon";

grant update on table "public"."statement_hashtag" to "anon";

grant delete on table "public"."statement_hashtag" to "authenticated";

grant insert on table "public"."statement_hashtag" to "authenticated";

grant references on table "public"."statement_hashtag" to "authenticated";

grant select on table "public"."statement_hashtag" to "authenticated";

grant trigger on table "public"."statement_hashtag" to "authenticated";

grant truncate on table "public"."statement_hashtag" to "authenticated";

grant update on table "public"."statement_hashtag" to "authenticated";

grant delete on table "public"."statement_hashtag" to "service_role";

grant insert on table "public"."statement_hashtag" to "service_role";

grant references on table "public"."statement_hashtag" to "service_role";

grant select on table "public"."statement_hashtag" to "service_role";

grant trigger on table "public"."statement_hashtag" to "service_role";

grant truncate on table "public"."statement_hashtag" to "service_role";

grant update on table "public"."statement_hashtag" to "service_role";

grant delete on table "public"."statement_support_vote" to "anon";

grant insert on table "public"."statement_support_vote" to "anon";

grant references on table "public"."statement_support_vote" to "anon";

grant select on table "public"."statement_support_vote" to "anon";

grant trigger on table "public"."statement_support_vote" to "anon";

grant truncate on table "public"."statement_support_vote" to "anon";

grant update on table "public"."statement_support_vote" to "anon";

grant delete on table "public"."statement_support_vote" to "authenticated";

grant insert on table "public"."statement_support_vote" to "authenticated";

grant references on table "public"."statement_support_vote" to "authenticated";

grant select on table "public"."statement_support_vote" to "authenticated";

grant trigger on table "public"."statement_support_vote" to "authenticated";

grant truncate on table "public"."statement_support_vote" to "authenticated";

grant update on table "public"."statement_support_vote" to "authenticated";

grant delete on table "public"."statement_support_vote" to "service_role";

grant insert on table "public"."statement_support_vote" to "service_role";

grant references on table "public"."statement_support_vote" to "service_role";

grant select on table "public"."statement_support_vote" to "service_role";

grant trigger on table "public"."statement_support_vote" to "service_role";

grant truncate on table "public"."statement_support_vote" to "service_role";

grant update on table "public"."statement_support_vote" to "service_role";

grant delete on table "public"."statement_survey" to "anon";

grant insert on table "public"."statement_survey" to "anon";

grant references on table "public"."statement_survey" to "anon";

grant select on table "public"."statement_survey" to "anon";

grant trigger on table "public"."statement_survey" to "anon";

grant truncate on table "public"."statement_survey" to "anon";

grant update on table "public"."statement_survey" to "anon";

grant delete on table "public"."statement_survey" to "authenticated";

grant insert on table "public"."statement_survey" to "authenticated";

grant references on table "public"."statement_survey" to "authenticated";

grant select on table "public"."statement_survey" to "authenticated";

grant trigger on table "public"."statement_survey" to "authenticated";

grant truncate on table "public"."statement_survey" to "authenticated";

grant update on table "public"."statement_survey" to "authenticated";

grant delete on table "public"."statement_survey" to "service_role";

grant insert on table "public"."statement_survey" to "service_role";

grant references on table "public"."statement_survey" to "service_role";

grant select on table "public"."statement_survey" to "service_role";

grant trigger on table "public"."statement_survey" to "service_role";

grant truncate on table "public"."statement_survey" to "service_role";

grant update on table "public"."statement_survey" to "service_role";

grant delete on table "public"."statement_survey_option" to "anon";

grant insert on table "public"."statement_survey_option" to "anon";

grant references on table "public"."statement_survey_option" to "anon";

grant select on table "public"."statement_survey_option" to "anon";

grant trigger on table "public"."statement_survey_option" to "anon";

grant truncate on table "public"."statement_survey_option" to "anon";

grant update on table "public"."statement_survey_option" to "anon";

grant delete on table "public"."statement_survey_option" to "authenticated";

grant insert on table "public"."statement_survey_option" to "authenticated";

grant references on table "public"."statement_survey_option" to "authenticated";

grant select on table "public"."statement_survey_option" to "authenticated";

grant trigger on table "public"."statement_survey_option" to "authenticated";

grant truncate on table "public"."statement_survey_option" to "authenticated";

grant update on table "public"."statement_survey_option" to "authenticated";

grant delete on table "public"."statement_survey_option" to "service_role";

grant insert on table "public"."statement_survey_option" to "service_role";

grant references on table "public"."statement_survey_option" to "service_role";

grant select on table "public"."statement_survey_option" to "service_role";

grant trigger on table "public"."statement_survey_option" to "service_role";

grant truncate on table "public"."statement_survey_option" to "service_role";

grant update on table "public"."statement_survey_option" to "service_role";

grant delete on table "public"."statement_survey_vote" to "anon";

grant insert on table "public"."statement_survey_vote" to "anon";

grant references on table "public"."statement_survey_vote" to "anon";

grant select on table "public"."statement_survey_vote" to "anon";

grant trigger on table "public"."statement_survey_vote" to "anon";

grant truncate on table "public"."statement_survey_vote" to "anon";

grant update on table "public"."statement_survey_vote" to "anon";

grant delete on table "public"."statement_survey_vote" to "authenticated";

grant insert on table "public"."statement_survey_vote" to "authenticated";

grant references on table "public"."statement_survey_vote" to "authenticated";

grant select on table "public"."statement_survey_vote" to "authenticated";

grant trigger on table "public"."statement_survey_vote" to "authenticated";

grant truncate on table "public"."statement_survey_vote" to "authenticated";

grant update on table "public"."statement_survey_vote" to "authenticated";

grant delete on table "public"."statement_survey_vote" to "service_role";

grant insert on table "public"."statement_survey_vote" to "service_role";

grant references on table "public"."statement_survey_vote" to "service_role";

grant select on table "public"."statement_survey_vote" to "service_role";

grant trigger on table "public"."statement_survey_vote" to "service_role";

grant truncate on table "public"."statement_survey_vote" to "service_role";

grant update on table "public"."statement_survey_vote" to "service_role";


  create policy "service_role_all"
  on "public"."statement_hashtag"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."statement_support_vote"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."statement_survey"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."statement_survey_option"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."statement_survey_vote"
  as permissive
  for all
  to service_role
using (true);



