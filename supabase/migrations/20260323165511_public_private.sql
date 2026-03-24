alter table "public"."blog" alter column "is_public" set default true;

alter table "public"."blog" alter column "is_public" set not null;

alter table "public"."statement" add column "is_public" boolean not null default true;

alter table "public"."todo" add column "is_public" boolean not null default true;


