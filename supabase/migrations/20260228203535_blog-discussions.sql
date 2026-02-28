alter table "public"."thread" add column "blog_id" uuid;

CREATE INDEX idx_thread_blog ON public.thread USING btree (blog_id);

alter table "public"."thread" add constraint "thread_blog_id_fkey" FOREIGN KEY (blog_id) REFERENCES public.blog(id) ON DELETE CASCADE not valid;

alter table "public"."thread" validate constraint "thread_blog_id_fkey";


