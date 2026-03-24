alter table "public"."amendment" drop column "is_public";

alter table "public"."blog" drop column "is_public";

alter table "public"."election" drop column "is_public";

alter table "public"."election" add column "visibility" character varying not null default 'public'::character varying;

alter table "public"."event" drop column "is_public";

alter table "public"."group" drop column "is_public";

alter table "public"."statement" drop column "is_public";

alter table "public"."todo" drop column "is_public";

alter table "public"."user" drop column "is_public";

alter table "public"."vote" drop column "is_public";

alter table "public"."vote" add column "visibility" character varying not null default 'public'::character varying;


