'use client';

import { FlowEditor } from '@/components/ui-flow/flowEditor';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';

export default function FlowPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="h-full w-full">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">Flow Editor</h1>
            <p className="text-muted-foreground">
              Create and edit visual workflows and process diagrams.
            </p>
          </div>

          <div className="h-[600px] w-full rounded-lg border">
            <FlowEditor />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
