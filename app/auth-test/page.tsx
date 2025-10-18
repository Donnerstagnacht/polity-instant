'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/instant/auth';
import { LogIn, LogOut, User } from 'lucide-react';

export default function AuthTestPage() {
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogin = () => {
    // Simulate login with test user
    const testUser = {
      id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      name: 'Test User',
    };

    // This is for testing - in real app use the magic code flow
    useAuthStore.getState().login(testUser);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Auth Status Test
          </CardTitle>
          <CardDescription>
            Test the navigation behavior based on authentication status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>
              <strong>Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </p>
            {user && (
              <p>
                <strong>User:</strong> {user.name || user.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            {!isAuthenticated ? (
              <Button onClick={handleLogin} className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Simulate Login
              </Button>
            ) : (
              <Button onClick={handleLogout} variant="outline" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Watch the navigation bar change when you login/logout:</p>
            <ul className="mt-2 list-disc pl-5">
              <li>
                <strong>Not logged in:</strong> Only Home + Login buttons
              </li>
              <li>
                <strong>Logged in:</strong> Full navigation with all pages
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
