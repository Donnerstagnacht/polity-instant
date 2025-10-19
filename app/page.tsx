'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useAuthStore } from '@/features/auth/auth.ts';
import { LogIn, UserPlus } from 'lucide-react';
// import { useTranslation } from 'react-i18next'; // Temporarily disabled

export default function HomePage() {
  // const { t } = useTranslation(); // Temporarily disabled
  const { isAuthenticated, user } = useAuthStore();

  return (
    <PageWrapper className="container mx-auto p-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">
          {isAuthenticated ? `Welcome back, ${user?.name || user?.email}!` : 'Welcome to Polity'}
        </h1>
        <p className="text-lg text-muted-foreground">
          A modern political platform built with Next.js
        </p>
      </div>

      {!isAuthenticated && (
        <div className="mb-8">
          <Card className="mx-auto max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <LogIn className="h-5 w-5" />
                Get Started
              </CardTitle>
              <CardDescription>
                Join Polity to access all features and connect with the community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/auth" className="block">
                <Button className="w-full" size="lg">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up / Login
                </Button>
              </Link>
              <p className="text-center text-sm text-muted-foreground">
                Use your email to get a magic code for instant access
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
            <CardDescription>Explore the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Navigate through different sections of the platform</p>
          </CardContent>
          <CardFooter>
            {isAuthenticated ? (
              <Link href="/settings">
                <Button>Go to Settings</Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="outline">Login to Explore</Button>
              </Link>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Platform capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5">
              <li>User management</li>
              <li>Group discussions</li>
              <li>Project collaboration</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
            <CardDescription>Built with modern technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Frontend:</strong> React, Next.js, Lucide Icons
              </p>
              <p>
                <strong>Styling:</strong> Tailwind CSS, Shadcn UI
              </p>
              <p>
                <strong>Tooling:</strong> Next.js, TypeScript
              </p>
            </div>
          </CardContent>
          <CardFooter>
            {isAuthenticated ? (
              <Link href="/settings">
                <Button variant="outline">Explore Settings</Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="outline">Login to Access</Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    </PageWrapper>
  );
}
