'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'reminder' | 'other';
}

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Team Meeting',
    date: '2025-10-20',
    time: '10:00',
    type: 'meeting',
  },
  {
    id: '2',
    title: 'Project Deadline',
    date: '2025-10-22',
    time: '17:00',
    type: 'deadline',
  },
  {
    id: '3',
    title: 'Follow-up Call',
    date: '2025-10-25',
    time: '14:30',
    type: 'meeting',
  },
];

const getEventTypeColor = (type: Event['type']) => {
  switch (type) {
    case 'meeting':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'deadline':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'reminder':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export default function CalendarPage() {
  const [events] = useState<Event[]>(sampleEvents);

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and upcoming events.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your scheduled meetings, deadlines, and reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                      </div>
                      <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full">Add New Event</Button>
                <Button variant="outline" className="w-full">
                  View Full Calendar
                </Button>
                <Button variant="outline" className="w-full">
                  Export Calendar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendar Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Events this week:</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span>Meetings:</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex justify-between">
                  <span>Deadlines:</span>
                  <span className="font-semibold">1</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
