'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { seedCompleteUserProfile } from '../utils/seedUserData';
import { useAuthStore } from '@/lib/instant/auth';
import { Loader2, Database } from 'lucide-react';

/**
 * Development component to seed user data
 * Only use in development mode
 */
export function SeedUserDataButton() {
  const { user } = useAuthStore();
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    if (!user?.id) {
      setMessage('❌ You must be logged in to seed data');
      return;
    }

    setIsSeeding(true);
    setMessage(null);

    try {
      await seedCompleteUserProfile(user.id);
      setMessage('✅ Profile data seeded successfully! Refresh the page to see changes.');
    } catch (error) {
      console.error('Failed to seed data:', error);
      setMessage('❌ Failed to seed data. Check console for details.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end gap-2">
        {message && (
          <div className="rounded-md bg-background/95 px-4 py-2 text-sm shadow-lg backdrop-blur">
            {message}
          </div>
        )}
        <Button
          onClick={handleSeed}
          disabled={isSeeding || !user}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          {isSeeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Seed Profile Data
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
