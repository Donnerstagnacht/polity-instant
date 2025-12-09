'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  FileText,
  BookOpen,
  Scale,
  CheckSquare,
  Calendar,
  Edit,
  UserCheck,
  Briefcase,
} from 'lucide-react';

export default function CreatePage() {
  const items = [
    {
      href: '/create/group',
      icon: Users,
      title: 'Group',
      description: 'Organize members around common interests or goals',
    },
    {
      href: '/create/event',
      icon: Calendar,
      title: 'Event',
      description: 'Create and manage events for your community',
    },
    {
      href: '/create/statement',
      icon: FileText,
      title: 'Statement',
      description: 'Share your position or opinion on a topic',
    },
    {
      href: '/create/blog',
      icon: BookOpen,
      title: 'Blog Post',
      description: 'Write and share your thoughts with the community',
    },
    {
      href: '/create/amendment',
      icon: Scale,
      title: 'Amendment',
      description: 'Propose changes or new policies for consideration',
    },
    {
      href: '/create/todo',
      icon: CheckSquare,
      title: 'Todo',
      description: 'Create a task to track your work and progress',
    },
    {
      href: '/create/agenda-item',
      icon: Calendar,
      title: 'Agenda Item',
      description: 'Create an agenda item for an event (election, vote, speech)',
    },
    {
      href: '/create/change-request',
      icon: Edit,
      title: 'Change Request',
      description: 'Propose a change to an existing amendment',
    },
    {
      href: '/create/election-candidate',
      icon: UserCheck,
      title: 'Election Candidate',
      description: 'Add a candidate to an election',
    },
    {
      href: '/create/position',
      icon: Briefcase,
      title: 'Position',
      description: 'Create an elected position within a group',
    },
  ];

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Create New Item</h1>
          <p className="text-muted-foreground">Choose what you want to create</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What would you like to create?</CardTitle>
            <CardDescription>Choose the type of item you want to create</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  >
                    <Icon className="h-8 w-8" />
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
