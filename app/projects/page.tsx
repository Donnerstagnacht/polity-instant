'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';

export default function ProjectsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Projects</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Projects content */}
          <div className="rounded-lg border p-4">
            <h2 className="mb-2 text-lg font-semibold">Project 1</h2>
            <p className="text-muted-foreground">Project description</p>
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
