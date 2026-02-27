'use client';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { CreateDashboard } from '@/features/create/ui/CreateDashboard';

export default function CreatePage() {
  return (
    <AuthGuard requireAuth={true}>
      <CreateDashboard />
    </AuthGuard>
  );
}
