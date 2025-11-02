'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import {
  Users,
  UsersRound,
  Calendar,
  FileText,
  Search,
  CheckSquare,
  MessageSquare,
  Bell,
  ListTodo,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
} from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  details: {
    overview: string;
    capabilities: string[];
    benefits: string[];
  };
}

export default function FeaturesPage() {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const features: Feature[] = [
    {
      icon: Users,
      title: 'User Profiles',
      description:
        'Create detailed profiles, build networks, and connect with like-minded individuals across the platform.',
      details: {
        overview:
          'User profiles are the foundation of your presence on Polity. Build a comprehensive professional or civic identity that represents your interests, expertise, and involvement in democratic processes.',
        capabilities: [
          'Customizable profile pages with bio, avatar, and cover images',
          'Follow other users and build your network',
          'Track subscriptions to groups, events, and amendments',
          'Display memberships and participation history',
          'Privacy controls for personal information',
        ],
        benefits: [
          'Establish credibility within your communities',
          'Discover and connect with aligned individuals',
          'Track your civic engagement journey',
          'Build reputation through participation',
        ],
      },
    },
    {
      icon: UsersRound,
      title: 'Groups',
      description:
        'Form communities, organize teams, and collaborate on shared goals with powerful group management tools.',
      details: {
        overview:
          'Groups enable collective action and collaboration. Whether forming a political party, community organization, or advocacy coalition, groups provide the structure for democratic decision-making.',
        capabilities: [
          'Create public or private groups with hierarchical structures',
          'Manage member roles and permissions',
          'Group-specific documents and amendment workflows',
          'Event organization within groups',
          'Sub-group creation for complex organizations',
          'Group analytics and engagement metrics',
        ],
        benefits: [
          'Centralized communication for teams',
          'Structured decision-making processes',
          'Clear member roles and responsibilities',
          'Transparent governance structures',
        ],
      },
    },
    {
      icon: Calendar,
      title: 'Events',
      description:
        'Plan meetings, town halls, and conferences with integrated scheduling and participant management.',
      details: {
        overview:
          'Events bring people together for deliberation, decision-making, and community building. From small committee meetings to large public forums, the event system handles all your scheduling needs.',
        capabilities: [
          'Create recurring or one-time events',
          'Integrated agenda management',
          'Participant registration and capacity limits',
          'Virtual and in-person event support',
          'Event streaming and recording',
          'Automated reminders and notifications',
          'Post-event documentation and minutes',
        ],
        benefits: [
          'Streamlined event organization',
          'Increased participation rates',
          'Better meeting preparation with shared agendas',
          'Historical record of all gatherings',
        ],
      },
    },
    {
      icon: FileText,
      title: 'Amendments',
      description:
        'Propose, discuss, and track policy changes with transparent amendment processes and version control.',
      details: {
        overview:
          'The amendment system is the heart of collaborative policy development. Propose changes, gather feedback, track revisions, and build consensus through a transparent, version-controlled process.',
        capabilities: [
          'Rich text editor for policy documents',
          'Version control with full change history',
          'Inline commenting and discussion threads',
          'Change request workflows',
          'Collaborative editing with multiple authors',
          'Amendment status tracking (draft, review, approved)',
          'Support for complex document structures',
        ],
        benefits: [
          'Transparent policy development',
          'Inclusive input from stakeholders',
          'Clear audit trail of changes',
          'Reduced errors through collaborative review',
        ],
      },
    },
    {
      icon: ListTodo,
      title: 'Agendas',
      description:
        'Structure meetings and events with collaborative agenda building and real-time updates.',
      details: {
        overview:
          'Agendas ensure productive meetings with clear objectives. Build them collaboratively, link to relevant documents, and keep everyone aligned on discussion topics.',
        capabilities: [
          'Collaborative agenda item creation',
          'Time allocation for each topic',
          'Attach documents and amendments to agenda items',
          'Voting mechanisms for controversial items',
          'Real-time updates during meetings',
          'Meeting minutes generation',
        ],
        benefits: [
          'More focused and productive meetings',
          'Transparent decision-making processes',
          'Better preparation for participants',
          'Automated documentation of outcomes',
        ],
      },
    },
    {
      icon: Search,
      title: 'Advanced Search',
      description:
        'Find people, groups, events, and documents quickly with powerful semantic search capabilities.',
      details: {
        overview:
          'Powerful search helps you discover relevant content across the entire platform. Find people with specific expertise, policies on particular topics, or events in your area.',
        capabilities: [
          'Full-text search across all content types',
          'Semantic search for contextual understanding',
          'Advanced filtering by date, location, tags, etc.',
          'Saved searches and alerts',
          'Search within specific groups or contexts',
          'Autocomplete suggestions',
        ],
        benefits: [
          'Quick access to relevant information',
          'Discover new communities and opportunities',
          'Stay updated on topics of interest',
          'Efficient research and due diligence',
        ],
      },
    },
    {
      icon: Calendar,
      title: 'Calendar',
      description:
        'Manage your schedule with integrated calendar views for all your events and meetings.',
      details: {
        overview:
          'Stay organized with a unified calendar that shows all your commitments - group meetings, public events, amendment deadlines, and personal tasks in one place.',
        capabilities: [
          'Day, week, and month views',
          'Integration with all platform events',
          'Personal task integration',
          'Amendment deadline tracking',
          'Calendar export (iCal, Google Calendar)',
          'Customizable notifications',
        ],
        benefits: [
          'Never miss important meetings or deadlines',
          'Balance multiple commitments',
          'Plan participation strategically',
          'Sync with external calendars',
        ],
      },
    },
    {
      icon: CheckSquare,
      title: 'Tasks',
      description:
        'Stay organized with personal and shared task management integrated across the platform.',
      details: {
        overview:
          'Tasks help you track commitments, delegate responsibilities, and ensure follow-through on decisions. Integrated throughout the platform for seamless workflow.',
        capabilities: [
          'Personal and shared task lists',
          'Task assignment and delegation',
          'Due dates and reminders',
          'Task prioritization',
          'Progress tracking and completion status',
          'Integration with events and amendments',
        ],
        benefits: [
          'Clear accountability for action items',
          'Better project coordination',
          'Reduced dropped commitments',
          'Visible progress on initiatives',
        ],
      },
    },
    {
      icon: MessageSquare,
      title: 'Messages',
      description: 'Communicate directly with individuals and groups through real-time messaging.',
      details: {
        overview:
          'Direct messaging enables quick communication and coordination. Have private conversations, create group chats, or discuss specific content items in context.',
        capabilities: [
          'One-on-one and group messaging',
          'Real-time message delivery',
          'File and link sharing',
          'Message threading and replies',
          'Read receipts and typing indicators',
          'Message search and history',
        ],
        benefits: [
          'Fast coordination and clarification',
          'Reduced email overload',
          'Context-aware discussions',
          'Improved team communication',
        ],
      },
    },
    {
      icon: Bell,
      title: 'Notifications',
      description:
        'Stay informed with intelligent notifications for important updates and activities.',
      details: {
        overview:
          'Smart notifications keep you informed without overwhelming you. Customize what you hear about and how you receive updates.',
        capabilities: [
          'Customizable notification preferences',
          'Email, web, and mobile notifications',
          'Activity digests (daily, weekly)',
          'Priority alerts for urgent items',
          'Notification grouping and categorization',
          'Mute and snooze options',
        ],
        benefits: [
          'Stay informed on what matters most',
          'Reduce notification fatigue',
          'Never miss critical updates',
          'Control your attention and focus',
        ],
      },
    },
  ];

  const toggleFeature = (index: number) => {
    setExpandedFeature(expandedFeature === index ? null : index);
  };

  return (
    <PageWrapper className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">Features</h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Everything you need to facilitate democratic collaboration and decision-making. Click any
          feature to learn more.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isExpanded = expandedFeature === index;
          return (
            <div
              key={index}
              className={`cursor-pointer transition-all ${isExpanded ? 'col-span-full' : ''}`}
              onClick={() => toggleFeature(index)}
            >
              <Card
                className={`h-full ${
                  isExpanded ? 'shadow-xl ring-2 ring-primary ring-offset-2' : 'hover:shadow-lg'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 space-y-6 border-t pt-6">
                      <div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {feature.details.overview}
                        </p>
                      </div>

                      <div>
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                            <Check className="h-3.5 w-3.5 text-primary" />
                          </div>
                          Key Capabilities
                        </h4>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {feature.details.capabilities.map((capability, capIndex) => (
                            <li
                              key={capIndex}
                              className="group flex items-start gap-3 rounded-lg border border-transparent p-2 transition-all hover:border-border hover:bg-accent/50"
                            >
                              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              </div>
                              <span className="text-sm leading-relaxed">{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/10">
                            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          Benefits
                        </h4>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {feature.details.benefits.map((benefit, benIndex) => (
                            <li
                              key={benIndex}
                              className="group flex items-start gap-3 rounded-lg border border-transparent p-2 transition-all hover:border-border hover:bg-accent/50"
                            >
                              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 group-hover:bg-amber-500/20">
                                <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                              </div>
                              <span className="text-sm leading-relaxed text-muted-foreground">
                                {benefit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">Ready to get started?</h2>
        <p className="mb-6 text-muted-foreground">
          Join thousands of organizations using Polity to make better decisions together
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/auth">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
