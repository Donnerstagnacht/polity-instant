'use client';

import { Suspense } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { VerifyForm } from '@/features/auth/ui/VerifyForm';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function VerifyPage() {
  return (
    <AuthGuard requireAuth={false}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
            <Card className="w-full max-w-md">
              <CardContent className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          </div>
        }
      >
        <VerifyForm />
      </Suspense>
    </AuthGuard>
  );
}
