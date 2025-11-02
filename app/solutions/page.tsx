'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import {
  Users,
  Building2,
  Landmark,
  Heart,
  Building,
  Newspaper,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function SolutionsPage() {
  const [selectedSolution, setSelectedSolution] = useState('humans');

  const solutions = [
    {
      id: 'humans',
      icon: Users,
      title: 'For Humans',
      tagline: 'Democracy starts with you',
      description:
        'Empower individuals to participate in democratic processes, organize local initiatives, and collaborate with communities. Every voice matters in shaping the future of our society.',
      features: [
        'Personal profile and network building',
        'Join and create grassroots movements',
        'Participate in local decision-making',
        'Connect with representatives',
      ],
      useCases: [
        'Organize neighborhood initiatives',
        'Participate in town hall meetings',
        'Build coalition networks',
        'Track local policy changes',
      ],
    },
    {
      id: 'political-parties',
      icon: Building2,
      title: 'For Political Parties',
      tagline: 'Modernize your political operations',
      description:
        'Modernize party operations with digital tools for member engagement, policy development, and campaign coordination. Build a stronger, more connected party that responds to member needs.',
      features: [
        'Member management and engagement',
        'Policy amendment workflows',
        'Internal voting and polling',
        'Campaign event coordination',
      ],
      useCases: [
        'Streamline policy development',
        'Conduct member surveys and votes',
        'Coordinate campaign volunteers',
        'Track amendment progress',
      ],
    },
    {
      id: 'government',
      icon: Landmark,
      title: 'For Government',
      tagline: 'Transparent governance in action',
      description:
        'Enhance transparency and citizen participation with tools for public consultation, legislative tracking, and community engagement. Build trust through open, accessible democratic processes.',
      features: [
        'Public consultation platforms',
        'Legislative amendment tracking',
        'Town hall and meeting management',
        'Transparent decision documentation',
      ],
      useCases: [
        'Host virtual town halls',
        'Gather public feedback on policies',
        'Track legislative processes',
        'Publish decision rationales',
      ],
    },
    {
      id: 'ngos',
      icon: Heart,
      title: 'For NGOs',
      tagline: 'Amplify your impact',
      description:
        'Strengthen advocacy efforts with collaborative tools for coalition building, campaign management, and stakeholder engagement. Coordinate multiple organizations toward common goals with transparent processes.',
      features: [
        'Coalition and network management',
        'Campaign coordination',
        'Volunteer organization',
        'Impact tracking and reporting',
      ],
      useCases: [
        'Build multi-stakeholder coalitions',
        'Launch coordinated campaigns',
        'Manage volunteer teams',
        'Document social impact',
      ],
    },
    {
      id: 'corporations',
      icon: Building,
      title: 'For Corporations',
      tagline: 'Democratic corporate governance',
      description:
        'Foster employee engagement and transparent governance with tools for internal democracy and stakeholder consultation. Create a culture of participation and shared decision-making.',
      features: [
        'Employee participation programs',
        'Stakeholder consultation',
        'Corporate governance transparency',
        'Team collaboration and decision-making',
      ],
      useCases: [
        'Employee feedback programs',
        'Board-employee communication',
        'Sustainability initiatives',
        'Transparent policy development',
      ],
    },
    {
      id: 'media',
      icon: Newspaper,
      title: 'For Media',
      tagline: 'Participatory journalism platform',
      description:
        'Enable participatory journalism and community engagement with tools for collaborative reporting and audience interaction. Build trust through transparent editorial processes and community involvement.',
      features: [
        'Community-driven story development',
        'Public discussion forums',
        'Transparent editorial processes',
        'Audience engagement analytics',
      ],
      useCases: [
        'Crowdsource story ideas',
        'Host public debates',
        'Track story development',
        'Measure audience impact',
      ],
    },
  ];

  const currentSolution = solutions.find(s => s.id === selectedSolution) || solutions[0];
  const Icon = currentSolution.icon;

  return (
    <PageWrapper className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">Solutions</h1>
        <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
          Tailored for every type of organization and individual committed to democratic
          collaboration. Discover how Polity can transform your decision-making processes.
        </p>
      </div>

      {/* Solution Selector */}
      <div className="mx-auto mb-12 max-w-4xl">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map(solution => {
            const SolutionIcon = solution.icon;
            const isSelected = selectedSolution === solution.id;
            return (
              <button
                key={solution.id}
                onClick={() => setSelectedSolution(solution.id)}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'bg-background hover:border-primary hover:shadow-md'
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                  }`}
                >
                  <SolutionIcon className={`h-6 w-6 ${isSelected ? '' : 'text-primary'}`} />
                </div>
                <span className="font-medium">{solution.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Solution Card */}
      <div className="mx-auto mb-16 max-w-4xl">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <CardTitle className="text-3xl">{currentSolution.title}</CardTitle>
                <p className="text-lg font-medium text-primary">{currentSolution.tagline}</p>
                <CardDescription className="text-base leading-relaxed">
                  {currentSolution.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Features */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Key Features
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {currentSolution.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Use Cases */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Common Use Cases
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {currentSolution.useCases.map((useCase, useCaseIndex) => (
                  <li key={useCaseIndex} className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">Find your perfect solution</h2>
        <p className="mb-6 text-muted-foreground">
          No matter your organization type, Polity has the tools you need
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/auth">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/features">
            <Button size="lg" variant="outline">
              Explore Features
            </Button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
