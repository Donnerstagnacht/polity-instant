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
// import { useTranslation } from 'react-i18next'; // Temporarily disabled

export default function HomePage() {
  // const { t } = useTranslation(); // Temporarily disabled

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Polity</h1>
        <p className="text-lg text-muted-foreground">
          A modern political platform built with Next.js
        </p>
      </div>

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
            <Link href="/settings">
              <Button>Go to Settings</Button>
            </Link>
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
            <Link href="/settings">
              <Button variant="outline">Explore Settings</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
