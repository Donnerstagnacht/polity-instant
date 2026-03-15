ALTER TABLE public.blog_blogger
  ADD CONSTRAINT blog_blogger_role_id_fkey
  FOREIGN KEY (role_id) REFERENCES public.role (id) ON DELETE SET NULL;
