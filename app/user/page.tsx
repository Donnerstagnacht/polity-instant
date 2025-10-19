'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';

function UserContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const name = searchParams.get('name') || 'Unknown User';

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">User Profile</h1>
        {userId && <p className="text-muted-foreground">Viewing profile for user ID: {userId}</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold">User Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {name}
            </p>
            <p>
              <strong>ID:</strong> {userId || 'Not specified'}
            </p>
            <p>
              <strong>Status:</strong> Active
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold">Activity</h2>
          <p className="text-muted-foreground">
            User activity and statistics will be displayed here.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold">Recent Actions</h2>
          <p className="text-muted-foreground">No recent actions to display.</p>
        </div>
      </div>
    </div>
  );
}

export default function UserPage() {
  return (
    <AuthGuard requireAuth={true}>
      <Suspense fallback={<div>Loading user profile...</div>}>
        <UserContent />
      </Suspense>
    </AuthGuard>
  );
}
