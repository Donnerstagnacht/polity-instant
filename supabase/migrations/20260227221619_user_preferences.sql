alter table "public"."user_preference" add column "language" text not null default 'en'::text;

alter table "public"."user_preference" add column "navigation_view" text not null default 'asButtonList'::text;

alter table "public"."user_preference" add column "theme" text not null default 'system'::text;


