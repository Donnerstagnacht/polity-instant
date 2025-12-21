'use client';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { CreateBlogForm } from '@/features/blogs/ui/CreateBlogForm';

export default function CreateBlogPage() {
  return (
    <AuthGuard requireAuth={true}>
      <CreateBlogForm />
    </AuthGuard>
  );
}
