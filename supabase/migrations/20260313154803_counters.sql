drop policy "service_role_all" on "public"."user_stats";

revoke delete on table "public"."user_stats" from "anon";

revoke insert on table "public"."user_stats" from "anon";

revoke references on table "public"."user_stats" from "anon";

revoke select on table "public"."user_stats" from "anon";

revoke trigger on table "public"."user_stats" from "anon";

revoke truncate on table "public"."user_stats" from "anon";

revoke update on table "public"."user_stats" from "anon";

revoke delete on table "public"."user_stats" from "authenticated";

revoke insert on table "public"."user_stats" from "authenticated";

revoke references on table "public"."user_stats" from "authenticated";

revoke select on table "public"."user_stats" from "authenticated";

revoke trigger on table "public"."user_stats" from "authenticated";

revoke truncate on table "public"."user_stats" from "authenticated";

revoke update on table "public"."user_stats" from "authenticated";

revoke delete on table "public"."user_stats" from "service_role";

revoke insert on table "public"."user_stats" from "service_role";

revoke references on table "public"."user_stats" from "service_role";

revoke select on table "public"."user_stats" from "service_role";

revoke trigger on table "public"."user_stats" from "service_role";

revoke truncate on table "public"."user_stats" from "service_role";

revoke update on table "public"."user_stats" from "service_role";

alter table "public"."user_stats" drop constraint "user_stats_user_id_fkey";

alter table "public"."user_stats" drop constraint "user_stats_pkey";

drop index if exists "public"."idx_event_meeting_type";

drop index if exists "public"."idx_user_stats_user";

drop index if exists "public"."user_stats_pkey";

drop table "public"."user_stats";

alter table "public"."amendment" add column "change_request_count" integer not null default 0;

alter table "public"."amendment" add column "clone_count" integer not null default 0;

alter table "public"."amendment" add column "subscriber_count" integer not null default 0;

alter table "public"."blog" add column "subscriber_count" integer not null default 0;

alter table "public"."blog" add column "supporter_count" integer not null default 0;

alter table "public"."event" add column "amendment_count" integer not null default 0;

alter table "public"."event" add column "election_count" integer not null default 0;

alter table "public"."event" add column "open_change_request_count" integer not null default 0;

alter table "public"."event" add column "subscriber_count" integer not null default 0;

alter table "public"."group" add column "subscriber_count" integer not null default 0;

alter table "public"."user" add column "amendment_count" integer not null default 0;

alter table "public"."user" add column "group_count" integer not null default 0;

alter table "public"."user" add column "subscriber_count" integer not null default 0;


