'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  BookOpen,
  Scale,
  List,
  Layers,
  CheckSquare,
  Calendar,
  Edit,
  UserCheck,
  Briefcase,
} from 'lucide-react';
import { db, tx, id } from '@/../db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { HashtagInput } from '@/components/ui/hashtag-input';
import { TypeAheadSelect } from '@/components/ui/type-ahead-select';
import {
  EventSelectCard,
  GroupSelectCard,
  AmendmentSelectCard,
  ElectionSelectCard,
  PositionSelectCard,
  AmendmentVoteSelectCard,
  AgendaItemSelectCard,
} from '@/components/ui/entity-select-cards';

type ItemType =
  | 'groups'
  | 'events'
  | 'statements'
  | 'blogs'
  | 'amendments'
  | 'todos'
  | 'agendaItems'
  | 'changeRequests'
  | 'electionCandidates'
  | 'positions'
  | null;

export default function CreatePage() {
  const [isCarouselMode, setIsCarouselMode] = useState(true);
  const [selectedItemType, setSelectedItemType] = useState<ItemType>('groups');

  // Guided mode uses a unified flow
  if (isCarouselMode) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">Create New Item</h1>
            <p className="text-muted-foreground">Follow the guided steps to create your item</p>
          </div>

          {/* Toggle for Carousel vs Form Mode */}
          <div className="mb-6 flex items-center justify-end gap-4 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <List
                className={`h-4 w-4 ${!isCarouselMode ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <Label htmlFor="mode-toggle" className="cursor-pointer text-sm font-medium">
                Guided Mode (One field at a time)
              </Label>
              <Switch
                id="mode-toggle"
                checked={isCarouselMode}
                onCheckedChange={setIsCarouselMode}
              />
              <Layers
                className={`h-4 w-4 ${isCarouselMode ? 'text-primary' : 'text-muted-foreground'}`}
              />
            </div>
          </div>

          <GuidedCreateFlow />
        </PageWrapper>
      </AuthGuard>
    );
  }

  // Form mode uses tabs
  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Create New Item</h1>
          <p className="text-muted-foreground">
            Choose what you want to create and fill in the details below
          </p>
        </div>

        {/* Toggle for Carousel vs Form Mode */}
        <div className="mb-6 flex items-center justify-end gap-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <List
              className={`h-4 w-4 ${!isCarouselMode ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <Label htmlFor="mode-toggle" className="cursor-pointer text-sm font-medium">
              Form Mode (All fields)
            </Label>
            <Switch id="mode-toggle" checked={isCarouselMode} onCheckedChange={setIsCarouselMode} />
            <Layers
              className={`h-4 w-4 ${isCarouselMode ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </div>
        </div>

        <Tabs
          defaultValue={selectedItemType || 'groups'}
          onValueChange={v => setSelectedItemType(v as ItemType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="statements" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Statements
            </TabsTrigger>
            <TabsTrigger value="blogs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Blogs
            </TabsTrigger>
            <TabsTrigger value="amendments" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Amendments
            </TabsTrigger>
            <TabsTrigger value="todos" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="agendaItems" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="changeRequests" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Change Requests
            </TabsTrigger>
            <TabsTrigger value="electionCandidates" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Positions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups">
            <CreateGroupForm isCarouselMode={false} />
          </TabsContent>

          <TabsContent value="events">
            <CreateEventForm isCarouselMode={false} />
          </TabsContent>

          <TabsContent value="statements">
            <CreateStatementForm isCarouselMode={false} />
          </TabsContent>

          <TabsContent value="blogs">
            <CreateBlogForm isCarouselMode={false} />
          </TabsContent>

          <TabsContent value="amendments">
            <CreateAmendmentForm isCarouselMode={false} />
          </TabsContent>

          <TabsContent value="todos">
            <CreateTodoForm isCarouselMode={false} />
          </TabsContent>

          <TabsContent value="agendaItems">
            <CreateAgendaItemForm />
          </TabsContent>

          <TabsContent value="changeRequests">
            <CreateChangeRequestForm />
          </TabsContent>

          <TabsContent value="electionCandidates">
            <CreateElectionCandidateForm />
          </TabsContent>

          <TabsContent value="positions">
            <CreatePositionForm />
          </TabsContent>
        </Tabs>
      </PageWrapper>
    </AuthGuard>
  );
}

// Unified Guided Flow Component
function GuidedCreateFlow() {
  const [selectedType, setSelectedType] = useState<ItemType>(null);
  const [formData, setFormData] = useState<any>({});

  if (!selectedType) {
    return <ItemTypeSelector onSelect={setSelectedType} />;
  }

  const commonProps = {
    formData,
    setFormData,
    onBack: () => setSelectedType(null),
  };

  switch (selectedType) {
    case 'groups':
      return <GuidedGroupFlow {...commonProps} />;
    case 'events':
      return <GuidedEventFlow {...commonProps} />;
    case 'statements':
      return <GuidedStatementFlow {...commonProps} />;
    case 'blogs':
      return <GuidedBlogFlow {...commonProps} />;
    case 'amendments':
      return <GuidedAmendmentFlow {...commonProps} />;
    case 'todos':
      return <GuidedTodoFlow {...commonProps} />;
    case 'agendaItems':
      return <GuidedAgendaItemFlow {...commonProps} />;
    case 'changeRequests':
      return <GuidedChangeRequestFlow {...commonProps} />;
    case 'electionCandidates':
      return <GuidedElectionCandidateFlow {...commonProps} />;
    case 'positions':
      return <GuidedPositionFlow {...commonProps} />;
    default:
      return null;
  }
}

// Item Type Selector for Guided Mode
function ItemTypeSelector({ onSelect }: { onSelect: (type: ItemType) => void }) {
  const items = [
    {
      type: 'groups' as ItemType,
      icon: Users,
      title: 'Group',
      description: 'Organize members around common interests or goals',
    },
    {
      type: 'events' as ItemType,
      icon: Calendar,
      title: 'Event',
      description: 'Create and manage events for your community',
    },
    {
      type: 'statements' as ItemType,
      icon: FileText,
      title: 'Statement',
      description: 'Share your position or opinion on a topic',
    },
    {
      type: 'blogs' as ItemType,
      icon: BookOpen,
      title: 'Blog Post',
      description: 'Write and share your thoughts with the community',
    },
    {
      type: 'amendments' as ItemType,
      icon: Scale,
      title: 'Amendment',
      description: 'Propose changes or new policies for consideration',
    },
    {
      type: 'todos' as ItemType,
      icon: CheckSquare,
      title: 'Todo',
      description: 'Create a task to track your work and progress',
    },
    {
      type: 'agendaItems' as ItemType,
      icon: Calendar,
      title: 'Agenda Item',
      description: 'Create an agenda item for an event (election, vote, speech)',
    },
    {
      type: 'changeRequests' as ItemType,
      icon: Edit,
      title: 'Change Request',
      description: 'Propose a change to an existing amendment',
    },
    {
      type: 'electionCandidates' as ItemType,
      icon: UserCheck,
      title: 'Election Candidate',
      description: 'Add a candidate to an election',
    },
    {
      type: 'positions' as ItemType,
      icon: Briefcase,
      title: 'Position',
      description: 'Create an elected position within a group',
    },
  ];

  return (
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
              <button
                key={item.type}
                onClick={() => onSelect(item.type)}
                className="flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
              >
                <Icon className="h-8 w-8" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ====== GUIDED FLOWS ======
function GuidedGroupFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const data = {
    name: formData.name || '',
    description: formData.description || '',
    isPublic: formData.isPublic ?? true,
    hashtags: formData.hashtags || ([] as string[]),
    visibility: formData.visibility || ('public' as 'public' | 'authenticated' | 'private'),
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleKeyDown = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && api && api.canScrollNext()) {
      e.preventDefault();
      api.scrollNext();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a group');
        return;
      }
      const groupId = id();
      const membershipId = id();
      const boardMemberRoleId = id();
      const memberRoleId = id();
      const conversationId = id();
      const conversationParticipantId = id();

      const transactions = [
        // Create the group
        tx.groups[groupId].update({
          name: data.name,
          description: data.description || '',
          isPublic: data.isPublic,
          memberCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          visibility: data.visibility,
        }),
        tx.groups[groupId].link({ owner: user.id }),

        // Create group conversation
        tx.conversations[conversationId]
          .update({
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            type: 'group',
            name: data.name,
            status: 'accepted',
          })
          .link({ group: groupId, requestedBy: user.id }),

        // Add creator as first conversation participant
        tx.conversationParticipants[conversationParticipantId].update({
          joinedAt: new Date().toISOString(),
        }),
        tx.conversationParticipants[conversationParticipantId].link({
          conversation: conversationId,
          user: user.id,
        }),

        // Create Board Member role with admin permissions
        tx.roles[boardMemberRoleId].update({
          name: 'Board Member',
          scope: 'group',
          createdAt: new Date(),
        }),
        tx.roles[boardMemberRoleId].link({ group: groupId }),

        // Create Member role with basic permissions
        tx.roles[memberRoleId].update({
          name: 'Member',
          scope: 'group',
          createdAt: new Date(),
        }),
        tx.roles[memberRoleId].link({ group: groupId }),

        // Create membership for creator as Board Member
        tx.groupMemberships[membershipId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.groupMemberships[membershipId].link({
          group: groupId,
          user: user.id,
          role: boardMemberRoleId,
        }),
      ];

      // Add hashtags
      data.hashtags.forEach((tag: string) => {
        const hashtagId = id();
        transactions.push(
          tx.hashtags[hashtagId].update({
            tag,
            createdAt: new Date(),
          }),
          tx.hashtags[hashtagId].link({ group: groupId })
        );
      });

      await db.transact(transactions);
      toast.success('Group created successfully!');
      setTimeout(() => (window.location.href = `/group/${groupId}`), 500);
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Group</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-group-name" className="text-lg">
                    What's the name of your group?
                  </Label>
                  <Input
                    id="guided-group-name"
                    placeholder="Enter group name"
                    value={data.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, data.name.trim() !== '')}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Press Enter to continue • Choose a clear, descriptive name
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-group-description" className="text-lg">
                    Describe your group (optional)
                  </Label>
                  <Textarea
                    id="guided-group-description"
                    placeholder="What's the purpose of this group?"
                    value={data.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, true)}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">Press Enter to continue</p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-4">
                  <Label className="text-lg">Privacy Settings</Label>
                  <div className="space-y-2">
                    <Label htmlFor="guided-group-visibility">Visibility</Label>
                    <select
                      id="guided-group-visibility"
                      value={data.visibility}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          visibility: e.target.value as 'public' | 'authenticated' | 'private',
                        })
                      }
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="public">Public - Anyone can see</option>
                      <option value="authenticated">Authenticated - Only logged-in users</option>
                      <option value="private">Private - Only members</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Public Group</p>
                      <p className="text-sm text-muted-foreground">Anyone can find and join</p>
                    </div>
                    <Switch
                      checked={data.isPublic}
                      onCheckedChange={checked => setFormData({ ...formData, isPublic: checked })}
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">Add Hashtags (Optional)</Label>
                  <HashtagInput
                    value={data.hashtags}
                    onChange={hashtags => setFormData({ ...formData, hashtags })}
                    placeholder="Add hashtags (e.g., politics, community)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Help others discover your group with hashtags
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !data.name.trim()} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button onClick={handleSubmit} disabled={isSubmitting || !data.name.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function GuidedStatementFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const data = {
    text: formData.text || '',
    tag: formData.tag || '',
    visibility: formData.visibility || ('public' as 'public' | 'authenticated' | 'private'),
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleKeyDown = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && api && api.canScrollNext()) {
      e.preventDefault();
      api.scrollNext();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a statement');
        return;
      }
      const statementId = id();
      await db.transact([
        tx.statements[statementId].update({
          text: data.text,
          tag: data.tag,
          visibility: data.visibility,
        }),
        tx.statements[statementId].link({ user: user.id }),
      ]);
      toast.success('Statement created successfully!');
      setTimeout(() => (window.location.href = `/statement/${statementId}`), 500);
    } catch (error) {
      console.error('Failed to create statement:', error);
      toast.error('Failed to create statement. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Statement</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-statement-text" className="text-lg">
                    What's your statement?
                  </Label>
                  <Textarea
                    id="guided-statement-text"
                    placeholder="Express your position or opinion"
                    value={data.text}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, data.text.trim() !== '')}
                    rows={8}
                    className="text-base"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Press Enter to continue • Be clear and concise
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-statement-tag" className="text-lg">
                    Add a tag
                  </Label>
                  <Input
                    id="guided-statement-tag"
                    placeholder="e.g., policy, opinion, announcement"
                    value={data.tag}
                    onChange={e => setFormData({ ...formData, tag: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, data.tag.trim() !== '')}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Help others categorize your statement
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-statement-visibility" className="text-lg">
                    Who can see this statement?
                  </Label>
                  <select
                    id="guided-statement-visibility"
                    value={data.visibility}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        visibility: e.target.value as 'public' | 'authenticated' | 'private',
                      })
                    }
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="public">Public - Anyone can see</option>
                    <option value="authenticated">Authenticated - Only logged-in users</option>
                    <option value="private">Private - Only you</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Choose who can view your statement
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !data.text.trim()} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !data.text.trim() || !data.tag.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Statement'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function GuidedBlogFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const data = {
    title: formData.title || '',
    date: formData.date || new Date().toISOString().split('T')[0],
    visibility: formData.visibility || ('public' as 'public' | 'authenticated' | 'private'),
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleKeyDown = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && api && api.canScrollNext()) {
      e.preventDefault();
      api.scrollNext();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a blog post');
        return;
      }
      const blogId = id();

      // Create roles for the blog
      const ownerRoleId = id();
      const writerRoleId = id();

      // Create the blogger entry for the creator (as Owner)
      const bloggerId = id();

      // Create action rights for Owner role
      const ownerUpdateRightId = id();
      const ownerDeleteRightId = id();
      const ownerManageRightId = id();

      // Create action right for Writer role
      const writerUpdateRightId = id();

      await db.transact([
        // Create the blog
        tx.blogs[blogId].update({
          title: data.title,
          date: data.date,
          likeCount: 0,
          commentCount: 0,
          visibility: data.visibility,
        }),

        // Create Owner role
        tx.roles[ownerRoleId].update({
          name: 'Owner',
          description: 'Blog owner with full permissions',
          scope: 'blog',
        }),
        tx.roles[ownerRoleId].link({ blog: blogId }),

        // Create Writer role
        tx.roles[writerRoleId].update({
          name: 'Writer',
          description: 'Blog writer with edit access',
          scope: 'blog',
        }),
        tx.roles[writerRoleId].link({ blog: blogId }),

        // Create action rights for Owner role
        tx.actionRights[ownerUpdateRightId].update({
          resource: 'blogs',
          action: 'update',
        }),
        tx.actionRights[ownerUpdateRightId].link({ roles: [ownerRoleId], blog: blogId }),

        tx.actionRights[ownerDeleteRightId].update({
          resource: 'blogs',
          action: 'delete',
        }),
        tx.actionRights[ownerDeleteRightId].link({ roles: [ownerRoleId], blog: blogId }),

        tx.actionRights[ownerManageRightId].update({
          resource: 'blogBloggers',
          action: 'manage',
        }),
        tx.actionRights[ownerManageRightId].link({ roles: [ownerRoleId], blog: blogId }),

        // Create action right for Writer role
        tx.actionRights[writerUpdateRightId].update({
          resource: 'blogs',
          action: 'update',
        }),
        tx.actionRights[writerUpdateRightId].link({ roles: [writerRoleId], blog: blogId }),

        // Assign creator as Owner
        tx.blogBloggers[bloggerId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.blogBloggers[bloggerId].link({
          blog: blogId,
          user: user.id,
          role: ownerRoleId,
        }),
      ]);
      toast.success('Blog post created successfully!');
      setTimeout(() => (window.location.href = `/blog/${blogId}`), 500);
    } catch (error) {
      console.error('Failed to create blog post:', error);
      toast.error('Failed to create blog post. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Blog Post</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-blog-title" className="text-lg">
                    What's your blog title?
                  </Label>
                  <Input
                    id="guided-blog-title"
                    placeholder="Enter a catchy title"
                    value={data.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, data.title.trim() !== '')}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Press Enter to continue • Choose an engaging title
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-blog-date" className="text-lg">
                    Publication Date
                  </Label>
                  <Input
                    id="guided-blog-date"
                    type="date"
                    value={data.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">When should this be published?</p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !data.title.trim()} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button onClick={handleSubmit} disabled={isSubmitting || !data.title.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Blog Post'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function GuidedAmendmentFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const data = {
    title: formData.title || '',
    subtitle: formData.subtitle || '',
    status: formData.status || 'Drafting',
    code: formData.code || '',
    date: formData.date || new Date().toISOString().split('T')[0],
    hashtags: formData.hashtags || ([] as string[]),
    visibility: formData.visibility || ('public' as 'public' | 'authenticated' | 'private'),
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleKeyDown = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && api && api.canScrollNext()) {
      e.preventDefault();
      api.scrollNext();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an amendment');
        return;
      }
      const amendmentId = id();
      const collaboratorId = id();
      const applicantRoleId = id();
      const collaboratorRoleId = id();

      const transactions = [
        // Create the amendment
        tx.amendments[amendmentId].update({
          title: data.title,
          subtitle: data.subtitle || '',
          status: data.status,
          supporters: 0,
          date: data.date,
          code: data.code || '',
          visibility: data.visibility,
        }),

        // Create Applicant role with admin permissions
        tx.roles[applicantRoleId].update({
          name: 'Applicant',
          scope: 'amendment',
          createdAt: new Date(),
        }),
        tx.roles[applicantRoleId].link({ amendment: amendmentId }),

        // Create Collaborator role with basic permissions
        tx.roles[collaboratorRoleId].update({
          name: 'Collaborator',
          scope: 'amendment',
          createdAt: new Date(),
        }),
        tx.roles[collaboratorRoleId].link({ amendment: amendmentId }),

        // Create collaboration for creator as Applicant
        tx.amendmentCollaborators[collaboratorId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.amendmentCollaborators[collaboratorId].link({
          user: user.id,
          amendment: amendmentId,
          role: applicantRoleId,
        }),
      ];

      // Add hashtags
      data.hashtags.forEach((tag: string) => {
        const hashtagId = id();
        transactions.push(
          tx.hashtags[hashtagId].update({
            tag,
            createdAt: new Date(),
          }),
          tx.hashtags[hashtagId].link({ amendment: amendmentId })
        );
      });

      await db.transact(transactions);
      toast.success('Amendment created successfully!');
      setTimeout(() => (window.location.href = `/amendment/${amendmentId}`), 500);
    } catch (error) {
      console.error('Failed to create amendment:', error);
      toast.error('Failed to create amendment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Amendment</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-amendment-title" className="text-lg">
                    Amendment Title
                  </Label>
                  <Input
                    id="guided-amendment-title"
                    placeholder="Enter the title"
                    value={data.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, data.title.trim() !== '')}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Press Enter to continue • Provide a clear, concise title
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-amendment-subtitle" className="text-lg">
                    Subtitle (Optional)
                  </Label>
                  <Input
                    id="guided-amendment-subtitle"
                    placeholder="Add a subtitle"
                    value={data.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, true)}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">Press Enter to continue</p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-amendment-status" className="text-lg">
                    Current Status
                  </Label>
                  <select
                    id="guided-amendment-status"
                    value={data.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Drafting">Drafting</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Passed">Passed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <p className="text-sm text-muted-foreground">What stage is this amendment in?</p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-amendment-code" className="text-lg">
                    Amendment Code (Optional)
                  </Label>
                  <Textarea
                    id="guided-amendment-code"
                    placeholder="Enter reference code"
                    value={data.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, true)}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">Press Enter to continue</p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-amendment-date" className="text-lg">
                    Amendment Date
                  </Label>
                  <Input
                    id="guided-amendment-date"
                    type="date"
                    value={data.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">When was this proposed?</p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-amendment-visibility" className="text-lg">
                    Who can see this amendment?
                  </Label>
                  <select
                    id="guided-amendment-visibility"
                    value={data.visibility}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        visibility: e.target.value as 'public' | 'authenticated' | 'private',
                      })
                    }
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="public">Public - Anyone can see</option>
                    <option value="authenticated">Authenticated - Only logged-in users</option>
                    <option value="private">Private - Only collaborators</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Choose who can view this amendment
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">Add Hashtags (Optional)</Label>
                  <HashtagInput
                    value={data.hashtags}
                    onChange={hashtags => setFormData({ ...formData, hashtags })}
                    placeholder="Add hashtags (e.g., policy, reform)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Add hashtags to help categorize your amendment
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !data.title.trim()} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button onClick={handleSubmit} disabled={isSubmitting || !data.title.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Amendment'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ====== TODO FORMS ======
function CreateTodoForm({ isCarouselMode }: { isCarouselMode: boolean }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
    tags: [] as string[],
    groupId: '', // Add group ID field
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  // Query user's groups for the dropdown
  const { data: groupsData } = db.useQuery({
    groups: {
      $: {
        where: {
          or: [{ 'owner.id': user?.id }, { 'memberships.user.id': user?.id }],
        },
      },
    },
  });

  const userGroups = groupsData?.groups || [];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a todo');
        setIsSubmitting(false);
        return;
      }

      const todoId = id();
      const assignmentId = id();
      const now = Date.now();

      const transactions = [
        tx.todos[todoId].update({
          title: formData.title,
          description: formData.description || '',
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : null,
          completedAt: null,
          tags: formData.tags.length > 0 ? formData.tags : null,
          createdAt: now,
          updatedAt: now,
        }),
        tx.todos[todoId].link({ creator: user.id }),
        tx.todoAssignments[assignmentId].update({
          assignedAt: now,
          role: 'assignee',
        }),
        tx.todoAssignments[assignmentId].link({ todo: todoId, user: user.id }),
      ];

      // Link to group if selected
      if (formData.groupId) {
        transactions.push(tx.todos[todoId].link({ group: formData.groupId }));
      }

      await db.transact(transactions);

      toast.success('Todo created successfully!');
      setTimeout(() => {
        window.location.href = '/todos';
      }, 500);
    } catch (error) {
      console.error('Failed to create todo:', error);
      toast.error('Failed to create todo. Please try again.');
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  if (isCarouselMode) {
    return (
      <CarouselTodoForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        tagInput={tagInput}
        setTagInput={setTagInput}
        addTag={addTag}
        removeTag={removeTag}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Todo</CardTitle>
        <CardDescription>Create a task to track your work and progress</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="todo-title">Title</Label>
            <Input
              id="todo-title"
              placeholder="Enter todo title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="todo-description">Description</Label>
            <Textarea
              id="todo-description"
              placeholder="Describe the task (optional)"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="todo-status">Status</Label>
              <select
                id="todo-status"
                value={formData.status}
                onChange={e =>
                  setFormData({
                    ...formData,
                    status: e.target.value as typeof formData.status,
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="todo-priority">Priority</Label>
              <select
                id="todo-priority"
                value={formData.priority}
                onChange={e =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as typeof formData.priority,
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="todo-dueDate">Due Date (Optional)</Label>
            <Input
              id="todo-dueDate"
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="todo-group">Link to Group (Optional)</Label>
            <TypeAheadSelect
              items={userGroups}
              value={formData.groupId}
              onChange={value => setFormData({ ...formData, groupId: value })}
              placeholder="Search for a group..."
              searchKeys={['name', 'description']}
              renderItem={group => <GroupSelectCard group={group} />}
              getItemId={group => group.id}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="todo-tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="todo-tags"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Todo'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function CarouselTodoForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
}: {
  formData: {
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: string;
    tags: string[];
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  tagInput: string;
  setTagInput: (value: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const canProceed = () => {
    if (current === 0) return formData.title.trim() !== '';
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Todo</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-todo-title" className="text-lg">
                    What needs to be done?
                  </Label>
                  <Input
                    id="carousel-todo-title"
                    placeholder="Enter todo title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific about the task you want to accomplish
                  </p>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-todo-description" className="text-lg">
                    Add more details (Optional)
                  </Label>
                  <Textarea
                    id="carousel-todo-description"
                    placeholder="Describe the task in more detail"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Add any additional context or requirements
                  </p>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-4">
                  <Label className="text-lg">Set Priority and Status</Label>
                  <div className="space-y-2">
                    <Label htmlFor="carousel-todo-priority">Priority</Label>
                    <select
                      id="carousel-todo-priority"
                      value={formData.priority}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as typeof formData.priority,
                        })
                      }
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carousel-todo-status">Status</Label>
                    <select
                      id="carousel-todo-status"
                      value={formData.status}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          status: e.target.value as typeof formData.status,
                        })
                      }
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-todo-dueDate" className="text-lg">
                    When is this due? (Optional)
                  </Label>
                  <Input
                    id="carousel-todo-dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Set a due date to keep yourself on track
                  </p>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">Add Tags (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag and press Enter"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Optional: Organize your todos with tags
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={!canProceed()} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-1">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index === current ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
        {current === count - 1 && (
          <Button onClick={onSubmit} disabled={isSubmitting || !formData.title.trim()}>
            {isSubmitting ? 'Creating...' : 'Create Todo'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function GuidedTodoFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const user = useAuthStore(state => state.user);

  // Query user's groups for the dropdown
  const { data: groupsData } = db.useQuery({
    groups: {
      $: {
        where: {
          or: [{ 'owner.id': user?.id }, { 'memberships.user.id': user?.id }],
        },
      },
    },
  });

  const userGroups = groupsData?.groups || [];

  const data = {
    title: formData.title || '',
    description: formData.description || '',
    status: formData.status || ('pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled'),
    priority: formData.priority || ('medium' as 'low' | 'medium' | 'high' | 'urgent'),
    dueDate: formData.dueDate || '',
    tags: formData.tags || ([] as string[]),
    groupId: formData.groupId || '',
    visibility: formData.visibility || ('public' as 'public' | 'authenticated' | 'private'),
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleKeyDown = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && api && api.canScrollNext()) {
      e.preventDefault();
      api.scrollNext();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...data.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: data.tags.filter((t: string) => t !== tag) });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a todo');
        return;
      }
      const todoId = id();
      const assignmentId = id();
      const now = Date.now();

      const transactions = [
        tx.todos[todoId].update({
          title: data.title,
          description: data.description || '',
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate ? new Date(data.dueDate).getTime() : null,
          completedAt: null,
          tags: data.tags.length > 0 ? data.tags : null,
          createdAt: now,
          updatedAt: now,
          visibility: data.visibility,
        }),
        tx.todos[todoId].link({ creator: user.id }),
        tx.todoAssignments[assignmentId].update({
          assignedAt: now,
          role: 'assignee',
        }),
        tx.todoAssignments[assignmentId].link({ todo: todoId, user: user.id }),
      ];

      // Link to group if selected
      if (data.groupId) {
        transactions.push(tx.todos[todoId].link({ group: data.groupId }));
      }

      await db.transact(transactions);

      toast.success('Todo created successfully!');
      setTimeout(() => (window.location.href = '/todos'), 500);
    } catch (error) {
      console.error('Failed to create todo:', error);
      toast.error('Failed to create todo. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Todo</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-todo-title" className="text-lg">
                    What needs to be done?
                  </Label>
                  <Input
                    id="guided-todo-title"
                    placeholder="Enter todo title"
                    value={data.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, data.title.trim() !== '')}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Press Enter to continue • Be specific about the task
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-todo-description" className="text-lg">
                    Add more details (optional)
                  </Label>
                  <Textarea
                    id="guided-todo-description"
                    placeholder="Describe the task in more detail"
                    value={data.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, true)}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">Press Enter to continue</p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-4">
                  <Label className="text-lg">Set Priority and Status</Label>
                  <div className="space-y-2">
                    <Label htmlFor="guided-todo-priority">Priority</Label>
                    <select
                      id="guided-todo-priority"
                      value={data.priority}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as typeof data.priority,
                        })
                      }
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guided-todo-status">Status</Label>
                    <select
                      id="guided-todo-status"
                      value={data.status}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          status: e.target.value as typeof data.status,
                        })
                      }
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-todo-dueDate" className="text-lg">
                    When is this due? (Optional)
                  </Label>
                  <Input
                    id="guided-todo-dueDate"
                    type="date"
                    value={data.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Set a due date to keep yourself on track
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">Link to a Group (Optional)</Label>
                  <TypeAheadSelect
                    items={userGroups}
                    value={data.groupId}
                    onChange={value => setFormData({ ...formData, groupId: value })}
                    placeholder="Search for a group..."
                    searchKeys={['name', 'description']}
                    renderItem={group => <GroupSelectCard group={group} />}
                    getItemId={group => group.id}
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Link this todo to a specific group
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">Add Tags (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag and press Enter"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  {data.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Optional: Organize your todos with tags
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !data.title.trim()} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button onClick={handleSubmit} disabled={isSubmitting || !data.title.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Todo'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ====== GROUP FORMS ======
function CreateGroupForm({ isCarouselMode }: { isCarouselMode: boolean }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    hashtags: [] as string[],
    visibility: 'public' as 'public' | 'authenticated' | 'private',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a group');
        setIsSubmitting(false);
        return;
      }

      const groupId = id();
      const membershipId = id();
      const boardMemberRoleId = id();
      const memberRoleId = id();
      const conversationId = id();
      const conversationParticipantId = id();

      const transactions = [
        // Create the group
        tx.groups[groupId].update({
          name: formData.name,
          description: formData.description || '',
          isPublic: formData.isPublic,
          memberCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          visibility: formData.visibility,
        }),
        tx.groups[groupId].link({ owner: user.id }),

        // Create group conversation
        tx.conversations[conversationId]
          .update({
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            type: 'group',
            name: formData.name,
            status: 'accepted',
          })
          .link({ group: groupId, requestedBy: user.id }),

        // Add creator as first conversation participant
        tx.conversationParticipants[conversationParticipantId].update({
          joinedAt: new Date().toISOString(),
        }),
        tx.conversationParticipants[conversationParticipantId].link({
          conversation: conversationId,
          user: user.id,
        }),

        // Create Board Member role with admin permissions
        tx.roles[boardMemberRoleId].update({
          name: 'Board Member',
          scope: 'group',
          createdAt: new Date(),
        }),
        tx.roles[boardMemberRoleId].link({ group: groupId }),

        // Create Member role with basic permissions
        tx.roles[memberRoleId].update({
          name: 'Member',
          scope: 'group',
          createdAt: new Date(),
        }),
        tx.roles[memberRoleId].link({ group: groupId }),

        // Create membership for creator as Board Member
        tx.groupMemberships[membershipId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.groupMemberships[membershipId].link({
          group: groupId,
          user: user.id,
          role: boardMemberRoleId,
        }),
      ];

      // Add hashtags
      formData.hashtags.forEach(tag => {
        const hashtagId = id();
        transactions.push(
          tx.hashtags[hashtagId].update({
            tag,
            createdAt: new Date(),
          }),
          tx.hashtags[hashtagId].link({ group: groupId })
        );
      });

      await db.transact(transactions);

      toast.success('Group created successfully!');
      setTimeout(() => {
        window.location.href = `/group/${groupId}`;
      }, 500);
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isCarouselMode) {
    return (
      <CarouselGroupForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Group</CardTitle>
        <CardDescription>
          Groups help organize members around common interests or goals
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="Enter group name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              placeholder="Describe the purpose of this group"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="group-public"
              checked={formData.isPublic}
              onCheckedChange={checked => setFormData({ ...formData, isPublic: checked })}
            />
            <Label htmlFor="group-public" className="cursor-pointer">
              Make this group public
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-visibility">Visibility</Label>
            <select
              id="group-visibility"
              value={formData.visibility}
              onChange={e =>
                setFormData({
                  ...formData,
                  visibility: e.target.value as 'public' | 'authenticated' | 'private',
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="public">Public - Anyone can see</option>
              <option value="authenticated">Authenticated - Only logged-in users</option>
              <option value="private">Private - Only members</option>
            </select>
          </div>
          <HashtagInput
            value={formData.hashtags}
            onChange={hashtags => setFormData({ ...formData, hashtags })}
            placeholder="Add hashtags (e.g., politics, community)"
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function CarouselGroupForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: {
  formData: { name: string; description: string; isPublic: boolean };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const canProceed = () => {
    if (current === 0) return formData.name.trim() !== '';
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Group</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-group-name" className="text-lg">
                    What's the name of your group?
                  </Label>
                  <Input
                    id="carousel-group-name"
                    placeholder="Enter group name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose a clear, descriptive name for your group
                  </p>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-group-description" className="text-lg">
                    Describe your group
                  </Label>
                  <Textarea
                    id="carousel-group-description"
                    placeholder="What's the purpose of this group?"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">Optional: Add more details</p>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-4">
                  <Label className="text-lg">Privacy Settings</Label>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Public Group</p>
                      <p className="text-sm text-muted-foreground">
                        Anyone can find and join this group
                      </p>
                    </div>
                    <Switch
                      checked={formData.isPublic}
                      onCheckedChange={checked => setFormData({ ...formData, isPublic: checked })}
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={!canProceed()} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-1">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index === current ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
        {current === count - 1 && (
          <Button onClick={onSubmit} disabled={isSubmitting || !formData.name.trim()}>
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ====== STATEMENT FORMS ======
function CreateStatementForm({ isCarouselMode }: { isCarouselMode: boolean }) {
  const [formData, setFormData] = useState({
    text: '',
    tag: '',
    visibility: 'public' as 'public' | 'authenticated' | 'private',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a statement');
        setIsSubmitting(false);
        return;
      }

      const statementId = id();

      await db.transact([
        tx.statements[statementId].update({
          text: formData.text,
          tag: formData.tag,
          visibility: formData.visibility,
        }),
        tx.statements[statementId].link({ user: user.id }),
      ]);

      toast.success('Statement created successfully!');
      setTimeout(() => {
        window.location.href = `/statement/${statementId}`;
      }, 500);
    } catch (error) {
      console.error('Failed to create statement:', error);
      toast.error('Failed to create statement. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isCarouselMode) {
    return (
      <CarouselStatementForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Statement</CardTitle>
        <CardDescription>Share your position or opinion on a topic</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="statement-text">Statement</Label>
            <Textarea
              id="statement-text"
              placeholder="Enter your statement"
              value={formData.text}
              onChange={e => setFormData({ ...formData, text: e.target.value })}
              rows={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="statement-tag">Tag</Label>
            <Input
              id="statement-tag"
              placeholder="e.g., policy, opinion, announcement"
              value={formData.tag}
              onChange={e => setFormData({ ...formData, tag: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="statement-visibility">Visibility</Label>
            <select
              id="statement-visibility"
              value={formData.visibility}
              onChange={e =>
                setFormData({
                  ...formData,
                  visibility: e.target.value as 'public' | 'authenticated' | 'private',
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="public">Public - Anyone can see</option>
              <option value="authenticated">Authenticated - Only logged-in users</option>
              <option value="private">Private - Only you</option>
            </select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Statement'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function CarouselStatementForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: {
  formData: { text: string; tag: string };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const canProceed = () => {
    if (current === 0) return formData.text.trim() !== '';
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Statement</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-statement-text" className="text-lg">
                    What's your statement?
                  </Label>
                  <Textarea
                    id="carousel-statement-text"
                    placeholder="Express your position or opinion"
                    value={formData.text}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                    rows={8}
                    className="text-base"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Be clear and concise in your statement
                  </p>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-statement-tag" className="text-lg">
                    Add a tag
                  </Label>
                  <Input
                    id="carousel-statement-tag"
                    placeholder="e.g., policy, opinion, announcement"
                    value={formData.tag}
                    onChange={e => setFormData({ ...formData, tag: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Help others categorize your statement
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={!canProceed()} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-1">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index === current ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
        {current === count - 1 && (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !formData.text.trim() || !formData.tag.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Statement'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ====== BLOG FORMS ======
function CreateBlogForm({ isCarouselMode }: { isCarouselMode: boolean }) {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    visibility: 'public' as 'public' | 'authenticated' | 'private',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a blog post');
        setIsSubmitting(false);
        return;
      }

      const blogId = id();

      // Create roles for the blog
      const ownerRoleId = id();
      const writerRoleId = id();

      // Create the blogger entry for the creator (as Owner)
      const bloggerId = id();

      // Create action rights for Owner role
      const ownerUpdateRightId = id();
      const ownerDeleteRightId = id();
      const ownerManageRightId = id();

      // Create action right for Writer role
      const writerUpdateRightId = id();

      await db.transact([
        // Create the blog
        tx.blogs[blogId].update({
          title: formData.title,
          date: formData.date,
          likeCount: 0,
          commentCount: 0,
          visibility: formData.visibility,
        }),

        // Create Owner role
        tx.roles[ownerRoleId].update({
          name: 'Owner',
          description: 'Blog owner with full permissions',
          scope: 'blog',
        }),
        tx.roles[ownerRoleId].link({ blog: blogId }),

        // Create Writer role
        tx.roles[writerRoleId].update({
          name: 'Writer',
          description: 'Blog writer with edit access',
          scope: 'blog',
        }),
        tx.roles[writerRoleId].link({ blog: blogId }),

        // Create action rights for Owner role
        tx.actionRights[ownerUpdateRightId].update({
          resource: 'blogs',
          action: 'update',
        }),
        tx.actionRights[ownerUpdateRightId].link({ roles: [ownerRoleId], blog: blogId }),

        tx.actionRights[ownerDeleteRightId].update({
          resource: 'blogs',
          action: 'delete',
        }),
        tx.actionRights[ownerDeleteRightId].link({ roles: [ownerRoleId], blog: blogId }),

        tx.actionRights[ownerManageRightId].update({
          resource: 'blogBloggers',
          action: 'manage',
        }),
        tx.actionRights[ownerManageRightId].link({ roles: [ownerRoleId], blog: blogId }),

        // Create action right for Writer role
        tx.actionRights[writerUpdateRightId].update({
          resource: 'blogs',
          action: 'update',
        }),
        tx.actionRights[writerUpdateRightId].link({ roles: [writerRoleId], blog: blogId }),

        // Assign creator as Owner
        tx.blogBloggers[bloggerId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.blogBloggers[bloggerId].link({
          blog: blogId,
          user: user.id,
          role: ownerRoleId,
        }),
      ]);

      toast.success('Blog post created successfully!');
      setTimeout(() => {
        window.location.href = `/blog/${blogId}`;
      }, 500);
    } catch (error) {
      console.error('Failed to create blog post:', error);
      toast.error('Failed to create blog post. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isCarouselMode) {
    return (
      <CarouselBlogForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Blog Post</CardTitle>
        <CardDescription>Write and share your thoughts with the community</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blog-title">Title</Label>
            <Input
              id="blog-title"
              placeholder="Enter blog title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-date">Date</Label>
            <Input
              id="blog-date"
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Blog Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function CarouselBlogForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: {
  formData: { title: string; date: string };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const canProceed = () => {
    if (current === 0) return formData.title.trim() !== '';
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Blog Post</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-blog-title" className="text-lg">
                    What's your blog title?
                  </Label>
                  <Input
                    id="carousel-blog-title"
                    placeholder="Enter a catchy title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose an engaging title for your blog post
                  </p>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-blog-date" className="text-lg">
                    Publication Date
                  </Label>
                  <Input
                    id="carousel-blog-date"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    When should this blog post be published?
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={!canProceed()} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-1">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index === current ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
        {current === count - 1 && (
          <Button onClick={onSubmit} disabled={isSubmitting || !formData.title.trim()}>
            {isSubmitting ? 'Creating...' : 'Create Blog Post'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ====== EVENT FORMS ======
function GuidedEventFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const data = {
    title: formData.title || '',
    description: formData.description || '',
    location: formData.location || '',
    startDate: formData.startDate || new Date().toISOString().split('T')[0],
    startTime: formData.startTime || '09:00',
    endDate: formData.endDate || new Date().toISOString().split('T')[0],
    endTime: formData.endTime || '17:00',
    capacity: formData.capacity || 50,
    isPublic: formData.isPublic ?? true,
    groupId: formData.groupId || '',
    visibility: formData.visibility || ('public' as 'public' | 'authenticated' | 'private'),
  };

  // Query user's groups for the dropdown
  const { data: groupsData } = db.useQuery({
    groups: {
      $: {
        where: {
          or: [{ 'owner.id': user?.id }, { 'memberships.user.id': user?.id }],
        },
      },
    },
  });

  const userGroups = groupsData?.groups || [];

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleKeyDown = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && api && api.canScrollNext()) {
      e.preventDefault();
      api.scrollNext();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an event');
        return;
      }

      if (!data.groupId) {
        toast.error('Please select a group for this event');
        setIsSubmitting(false);
        return;
      }

      const eventId = id();
      const participantId = id();
      const organizerRoleId = id();
      const participantRoleId = id();

      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

      await db.transact([
        // Create the event
        tx.events[eventId].update({
          title: data.title,
          description: data.description || '',
          location: data.location || '',
          startDate: startDateTime,
          endDate: endDateTime,
          isPublic: data.isPublic,
          capacity: data.capacity,
          createdAt: new Date(),
          updatedAt: new Date(),
          visibility: data.visibility,
        }),
        tx.events[eventId].link({ organizer: user.id, group: data.groupId }),

        // Create Organizer role with admin permissions
        tx.roles[organizerRoleId].update({
          name: 'Organizer',
          scope: 'event',
          createdAt: new Date(),
        }),
        tx.roles[organizerRoleId].link({ event: eventId }),

        // Create Participant role with basic permissions
        tx.roles[participantRoleId].update({
          name: 'Participant',
          scope: 'event',
          createdAt: new Date(),
        }),
        tx.roles[participantRoleId].link({ event: eventId }),

        // Create participation for creator as Organizer
        tx.eventParticipants[participantId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.eventParticipants[participantId].link({
          user: user.id,
          event: eventId,
          role: organizerRoleId,
        }),
      ]);

      toast.success('Event created successfully!');
      setTimeout(() => (window.location.href = `/event/${eventId}`), 500);
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Event</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-event-title" className="text-lg">
                    What's the event title?
                  </Label>
                  <Input
                    id="guided-event-title"
                    placeholder="Enter event title"
                    value={data.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, data.title.trim() !== '')}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Press Enter to continue • Choose a clear, descriptive title
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-event-description" className="text-lg">
                    Describe your event (optional)
                  </Label>
                  <Textarea
                    id="guided-event-description"
                    placeholder="What's the purpose of this event?"
                    value={data.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, true)}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">Press Enter to continue</p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">Select a Group</Label>
                  <TypeAheadSelect
                    items={userGroups}
                    value={data.groupId}
                    onChange={value => setFormData({ ...formData, groupId: value })}
                    placeholder="Search for a group..."
                    searchKeys={['name', 'description']}
                    renderItem={group => <GroupSelectCard group={group} />}
                    getItemId={group => group.id}
                  />
                  <p className="text-sm text-muted-foreground">
                    Events must be associated with a group
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-event-location" className="text-lg">
                    Event Location
                  </Label>
                  <Input
                    id="guided-event-location"
                    placeholder="Enter location or virtual link"
                    value={data.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, true)}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Physical address or virtual meeting link
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-4">
                  <Label className="text-lg">Start Date & Time</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="guided-event-start-date">Date</Label>
                      <Input
                        id="guided-event-start-date"
                        type="date"
                        value={data.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guided-event-start-time">Time</Label>
                      <Input
                        id="guided-event-start-time"
                        type="time"
                        value={data.startTime}
                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                        className="text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-4">
                  <Label className="text-lg">End Date & Time</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="guided-event-end-date">Date</Label>
                      <Input
                        id="guided-event-end-date"
                        type="date"
                        value={data.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guided-event-end-time">Time</Label>
                      <Input
                        id="guided-event-end-time"
                        type="time"
                        value={data.endTime}
                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                        className="text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guided-event-capacity" className="text-lg">
                      Event Capacity
                    </Label>
                    <Input
                      id="guided-event-capacity"
                      type="number"
                      min="1"
                      value={data.capacity}
                      onChange={e =>
                        setFormData({ ...formData, capacity: parseInt(e.target.value) || 50 })
                      }
                      className="text-lg"
                    />
                    <p className="text-sm text-muted-foreground">Maximum number of participants</p>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Public Event</p>
                      <p className="text-sm text-muted-foreground">
                        Anyone can find and join this event
                      </p>
                    </div>
                    <Switch
                      checked={data.isPublic}
                      onCheckedChange={checked => setFormData({ ...formData, isPublic: checked })}
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !data.title.trim()} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !data.title.trim() || !data.groupId}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function CreateEventForm({ isCarouselMode }: { isCarouselMode: boolean }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '17:00',
    capacity: 50,
    isPublic: true,
    groupId: '',
    visibility: 'public' as 'public' | 'authenticated' | 'private',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  // Query user's groups for the dropdown
  const { data: groupsData } = db.useQuery({
    groups: {
      $: {
        where: {
          or: [{ 'owner.id': user?.id }, { 'memberships.user.id': user?.id }],
        },
      },
    },
  });

  const userGroups = groupsData?.groups || [];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an event');
        setIsSubmitting(false);
        return;
      }

      if (!formData.groupId) {
        toast.error('Please select a group for this event');
        setIsSubmitting(false);
        return;
      }

      const eventId = id();
      const participantId = id();
      const organizerRoleId = id();
      const participantRoleId = id();

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      await db.transact([
        // Create the event
        tx.events[eventId].update({
          title: formData.title,
          description: formData.description || '',
          location: formData.location || '',
          startDate: startDateTime,
          endDate: endDateTime,
          isPublic: formData.isPublic,
          capacity: formData.capacity,
          createdAt: new Date(),
          updatedAt: new Date(),
          visibility: formData.visibility,
        }),
        tx.events[eventId].link({ organizer: user.id, group: formData.groupId }),

        // Create Organizer role with admin permissions
        tx.roles[organizerRoleId].update({
          name: 'Organizer',
          scope: 'event',
          createdAt: new Date(),
        }),
        tx.roles[organizerRoleId].link({ event: eventId }),

        // Create Participant role with basic permissions
        tx.roles[participantRoleId].update({
          name: 'Participant',
          scope: 'event',
          createdAt: new Date(),
        }),
        tx.roles[participantRoleId].link({ event: eventId }),

        // Create participation for creator as Organizer
        tx.eventParticipants[participantId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.eventParticipants[participantId].link({
          user: user.id,
          event: eventId,
          role: organizerRoleId,
        }),
      ]);

      toast.success('Event created successfully!');
      setTimeout(() => {
        window.location.href = `/event/${eventId}`;
      }, 500);
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isCarouselMode) {
    return null; // Carousel mode uses GuidedEventFlow
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Event</CardTitle>
        <CardDescription>Create and manage events for your community</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Event Title</Label>
            <Input
              id="event-title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              placeholder="Describe the purpose of this event"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-group">Group</Label>
            <TypeAheadSelect
              items={userGroups}
              value={formData.groupId}
              onChange={value => setFormData({ ...formData, groupId: value })}
              placeholder="Search for a group..."
              searchKeys={['name', 'description']}
              renderItem={group => <GroupSelectCard group={group} />}
              getItemId={group => group.id}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              placeholder="Physical address or virtual meeting link"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-start-date">Start Date</Label>
              <Input
                id="event-start-date"
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-start-time">Start Time</Label>
              <Input
                id="event-start-time"
                type="time"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-end-date">End Date</Label>
              <Input
                id="event-end-date"
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-end-time">End Time</Label>
              <Input
                id="event-end-time"
                type="time"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-capacity">Event Capacity</Label>
            <Input
              id="event-capacity"
              type="number"
              min="1"
              placeholder="Maximum number of participants"
              value={formData.capacity}
              onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 50 })}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="event-public"
              checked={formData.isPublic}
              onCheckedChange={checked => setFormData({ ...formData, isPublic: checked })}
            />
            <Label htmlFor="event-public" className="cursor-pointer">
              Make this event public
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// ====== AMENDMENT FORMS ======
function CreateAmendmentForm({ isCarouselMode }: { isCarouselMode: boolean }) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    status: 'Drafting',
    code: '',
    date: new Date().toISOString().split('T')[0],
    hashtags: [] as string[],
    visibility: 'public' as 'public' | 'authenticated' | 'private',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an amendment');
        setIsSubmitting(false);
        return;
      }

      const amendmentId = id();
      const collaboratorId = id();
      const applicantRoleId = id();
      const collaboratorRoleId = id();

      const transactions = [
        // Create the amendment
        tx.amendments[amendmentId].update({
          title: formData.title,
          subtitle: formData.subtitle || '',
          status: formData.status,
          supporters: 0,
          date: formData.date,
          code: formData.code || '',
          visibility: formData.visibility,
        }),

        // Create Applicant role with admin permissions
        tx.roles[applicantRoleId].update({
          name: 'Applicant',
          scope: 'amendment',
          createdAt: new Date(),
        }),
        tx.roles[applicantRoleId].link({ amendment: amendmentId }),

        // Create Collaborator role with basic permissions
        tx.roles[collaboratorRoleId].update({
          name: 'Collaborator',
          scope: 'amendment',
          createdAt: new Date(),
        }),
        tx.roles[collaboratorRoleId].link({ amendment: amendmentId }),

        // Create collaboration for creator as Applicant
        tx.amendmentCollaborators[collaboratorId].update({
          status: 'member',
          createdAt: new Date(),
        }),
        tx.amendmentCollaborators[collaboratorId].link({
          user: user.id,
          amendment: amendmentId,
          role: applicantRoleId,
        }),
      ];

      // Add hashtags
      formData.hashtags.forEach(tag => {
        const hashtagId = id();
        transactions.push(
          tx.hashtags[hashtagId].update({
            tag,
            createdAt: new Date(),
          }),
          tx.hashtags[hashtagId].link({ amendment: amendmentId })
        );
      });

      await db.transact(transactions);

      toast.success('Amendment created successfully!');
      setTimeout(() => {
        window.location.href = `/amendment/${amendmentId}`;
      }, 500);
    } catch (error) {
      console.error('Failed to create amendment:', error);
      toast.error('Failed to create amendment. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isCarouselMode) {
    return (
      <CarouselAmendmentForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Amendment</CardTitle>
        <CardDescription>Propose changes or new policies for consideration</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amendment-title">Title</Label>
            <Input
              id="amendment-title"
              placeholder="Enter amendment title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amendment-subtitle">Subtitle</Label>
            <Input
              id="amendment-subtitle"
              placeholder="Enter subtitle (optional)"
              value={formData.subtitle}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amendment-status">Status</Label>
            <select
              id="amendment-status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="Drafting">Drafting</option>
              <option value="Under Review">Under Review</option>
              <option value="Passed">Passed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amendment-code">Code (optional)</Label>
            <Textarea
              id="amendment-code"
              placeholder="Enter amendment code or reference"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amendment-date">Date</Label>
            <Input
              id="amendment-date"
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <HashtagInput
            value={formData.hashtags}
            onChange={hashtags => setFormData({ ...formData, hashtags })}
            placeholder="Add hashtags (e.g., policy, reform)"
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Amendment'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function CarouselAmendmentForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: {
  formData: { title: string; subtitle: string; status: string; code: string; date: string };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const canProceed = () => {
    if (current === 0) return formData.title.trim() !== '';
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Amendment</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-amendment-title" className="text-lg">
                    Amendment Title
                  </Label>
                  <Input
                    id="carousel-amendment-title"
                    placeholder="Enter the title of your amendment"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Provide a clear, concise title for your amendment
                  </p>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-amendment-subtitle" className="text-lg">
                    Subtitle (Optional)
                  </Label>
                  <Input
                    id="carousel-amendment-subtitle"
                    placeholder="Add a subtitle if needed"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Add additional context with a subtitle
                  </p>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-amendment-status" className="text-lg">
                    Current Status
                  </Label>
                  <select
                    id="carousel-amendment-status"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Drafting">Drafting</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Passed">Passed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    What stage is this amendment currently in?
                  </p>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-amendment-code" className="text-lg">
                    Amendment Code (Optional)
                  </Label>
                  <Textarea
                    id="carousel-amendment-code"
                    placeholder="Enter reference code or details"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Add reference codes or additional details
                  </p>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="carousel-amendment-date" className="text-lg">
                    Amendment Date
                  </Label>
                  <Input
                    id="carousel-amendment-date"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    When was this amendment proposed or enacted?
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={!canProceed()} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-1">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index === current ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
        {current === count - 1 && (
          <Button onClick={onSubmit} disabled={isSubmitting || !formData.title.trim()}>
            {isSubmitting ? 'Creating...' : 'Create Amendment'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ====== AGENDA ITEM FORMS ======
function CreateAgendaItemForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'discussion' as 'election' | 'vote' | 'speech' | 'discussion',
    order: 1,
    duration: '',
    eventId: '',
    amendmentId: '', // For vote type
    positionId: '', // For election type
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  // Query available events for the dropdown
  const { data: eventsData } = db.useQuery({
    events: {},
  });

  // Query available amendments for the dropdown (when type is vote)
  const { data: amendmentsData } = db.useQuery({
    amendments: {},
  });

  // Query available positions for the dropdown (when type is election)
  const { data: positionsData } = db.useQuery({
    positions: {
      group: {},
    },
  });

  const userEvents = eventsData?.events || [];

  const userAmendments = amendmentsData?.amendments || [];

  const userPositions = positionsData?.positions || [];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an agenda item');
        setIsSubmitting(false);
        return;
      }

      if (!formData.eventId) {
        toast.error('Please select an event for this agenda item');
        setIsSubmitting(false);
        return;
      }

      const agendaItemId = id();
      const now = new Date();

      const transactions = [
        tx.agendaItems[agendaItemId].update({
          title: formData.title,
          description: formData.description || '',
          type: formData.type,
          order: formData.order,
          duration: formData.duration ? parseInt(formData.duration) : null,
          status: 'pending',
          startTime: null,
          endTime: null,
          createdAt: now,
          updatedAt: now,
        }),
        tx.agendaItems[agendaItemId].link({
          event: formData.eventId,
          creator: user.id,
        }),
      ];

      // If creating an election, also create the election entity
      if (formData.type === 'election') {
        const electionId = id();
        const electionTx = tx.elections[electionId]
          .update({
            title: formData.title,
            description: formData.description || '',
            majorityType: 'relative',
            isMultipleChoice: false,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          })
          .link({ agendaItem: agendaItemId });

        // Link to position if selected
        if (formData.positionId) {
          electionTx.link({ position: formData.positionId });
        }

        transactions.push(electionTx);
      }

      await db.transact(transactions);

      toast.success('Agenda item created successfully!');
      setTimeout(() => {
        window.location.href = `/event/${formData.eventId}/agenda`;
      }, 500);
    } catch (error) {
      console.error('Failed to create agenda item:', error);
      toast.error('Failed to create agenda item. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Agenda Item</CardTitle>
        <CardDescription>Add an item to an event's agenda</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agenda-event">Event</Label>
            <TypeAheadSelect
              items={userEvents}
              value={formData.eventId}
              onChange={value => setFormData({ ...formData, eventId: value })}
              placeholder="Search for an event..."
              searchKeys={['title', 'description', 'location']}
              renderItem={event => <EventSelectCard event={event} />}
              getItemId={event => event.id}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agenda-title">Title</Label>
            <Input
              id="agenda-title"
              placeholder="Enter agenda item title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agenda-description">Description</Label>
            <Textarea
              id="agenda-description"
              placeholder="Describe this agenda item (optional)"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agenda-type">Type</Label>
              <select
                id="agenda-type"
                value={formData.type}
                onChange={e =>
                  setFormData({ ...formData, type: e.target.value as typeof formData.type })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="discussion">Discussion</option>
                <option value="speech">Speech</option>
                <option value="election">Election</option>
                <option value="vote">Vote</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agenda-order">Order</Label>
              <Input
                id="agenda-order"
                type="number"
                min="1"
                placeholder="1"
                value={formData.order}
                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>
          {formData.type === 'vote' && (
            <div className="space-y-2">
              <Label htmlFor="agenda-amendment">Amendment (optional)</Label>
              <TypeAheadSelect
                items={userAmendments}
                value={formData.amendmentId}
                onChange={value => setFormData({ ...formData, amendmentId: value })}
                placeholder="Search for an amendment..."
                searchKeys={['title', 'subtitle']}
                renderItem={amendment => <AmendmentSelectCard amendment={amendment} />}
                getItemId={amendment => amendment.id}
              />
            </div>
          )}
          {formData.type === 'election' && (
            <div className="space-y-2">
              <Label htmlFor="agenda-position">Position (optional)</Label>
              <TypeAheadSelect
                items={userPositions}
                value={formData.positionId}
                onChange={value => setFormData({ ...formData, positionId: value })}
                placeholder="Search for a position..."
                searchKeys={['title', 'description']}
                renderItem={position => <PositionSelectCard position={position} />}
                getItemId={position => position.id}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="agenda-duration">Duration (minutes, optional)</Label>
            <Input
              id="agenda-duration"
              type="number"
              min="1"
              placeholder="Enter duration in minutes"
              value={formData.duration}
              onChange={e => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Agenda Item'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function GuidedAgendaItemFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const { data: eventsData } = db.useQuery({
    events: {},
  });

  const { data: amendmentsData } = db.useQuery({
    amendments: {},
  });

  const { data: positionsData } = db.useQuery({
    positions: {
      group: {},
    },
  });

  const userEvents = eventsData?.events || [];

  const userAmendments = amendmentsData?.amendments || [];

  const userPositions = positionsData?.positions || [];

  const data = {
    title: formData.title || '',
    description: formData.description || '',
    type: formData.type || ('discussion' as 'election' | 'vote' | 'speech' | 'discussion'),
    order: formData.order || 1,
    duration: formData.duration || '',
    eventId: formData.eventId || '',
    amendmentId: formData.amendmentId || '',
    positionId: formData.positionId || '',
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleKeyDown = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && api?.canScrollNext()) {
      e.preventDefault();
      api.scrollNext();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an agenda item');
        return;
      }

      if (!data.eventId) {
        toast.error('Please select an event for this agenda item');
        return;
      }

      const agendaItemId = id();
      const now = new Date();

      const transactions = [
        tx.agendaItems[agendaItemId].update({
          title: data.title,
          description: data.description || '',
          type: data.type,
          order: data.order,
          duration: data.duration ? parseInt(data.duration) : null,
          status: 'pending',
          startTime: null,
          endTime: null,
          createdAt: now,
          updatedAt: now,
        }),
        tx.agendaItems[agendaItemId].link({
          event: data.eventId,
          creator: user.id,
        }),
      ];

      // If creating an election, also create the election entity
      if (data.type === 'election') {
        const electionId = id();
        const electionTx = tx.elections[electionId]
          .update({
            title: data.title,
            description: data.description || '',
            majorityType: 'relative',
            isMultipleChoice: false,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          })
          .link({ agendaItem: agendaItemId });

        // Link to position if selected
        if (data.positionId) {
          electionTx.link({ position: data.positionId });
        }

        transactions.push(electionTx);
      }

      await db.transact(transactions);

      toast.success('Agenda item created successfully!');
      setTimeout(() => {
        window.location.href = `/event/${data.eventId}/agenda`;
      }, 500);
    } catch (error) {
      console.error('Failed to create agenda item:', error);
      toast.error('Failed to create agenda item. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Agenda Item</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">Which event is this for?</Label>
                  <TypeAheadSelect
                    items={userEvents}
                    value={data.eventId}
                    onChange={value => setFormData({ ...formData, eventId: value })}
                    placeholder="Search for an event..."
                    searchKeys={['title', 'description', 'location']}
                    renderItem={event => <EventSelectCard event={event} />}
                    getItemId={event => event.id}
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose which event this agenda item belongs to
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-agenda-title" className="text-lg">
                    What's the agenda item title?
                  </Label>
                  <Input
                    id="guided-agenda-title"
                    placeholder="Enter agenda item title"
                    value={data.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, data.title.trim() !== '')}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific about what will be discussed or decided
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-agenda-description" className="text-lg">
                    Describe this agenda item (optional)
                  </Label>
                  <Textarea
                    id="guided-agenda-description"
                    placeholder="Describe this agenda item"
                    value={data.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Add more details about this item
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-4">
                  <Label className="text-lg">Type and Order</Label>
                  <div className="space-y-2">
                    <Label htmlFor="guided-agenda-type">Type</Label>
                    <select
                      id="guided-agenda-type"
                      value={data.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="discussion">Discussion</option>
                      <option value="speech">Speech</option>
                      <option value="election">Election</option>
                      <option value="vote">Vote</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guided-agenda-order">Order</Label>
                    <Input
                      id="guided-agenda-order"
                      type="number"
                      min="1"
                      value={data.order}
                      onChange={e =>
                        setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                      }
                      className="text-base"
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-agenda-duration" className="text-lg">
                    Duration (minutes, optional)
                  </Label>
                  <Input
                    id="guided-agenda-duration"
                    type="number"
                    min="1"
                    placeholder="Enter duration in minutes"
                    value={data.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: How long should this agenda item take?
                  </p>
                </div>
              </div>
            </CarouselItem>
            {data.type === 'vote' && (
              <CarouselItem>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <Label className="text-lg">Which amendment is this vote for? (optional)</Label>
                    <TypeAheadSelect
                      items={userAmendments}
                      value={data.amendmentId}
                      onChange={value => setFormData({ ...formData, amendmentId: value })}
                      placeholder="Search for an amendment..."
                      searchKeys={['title', 'subtitle']}
                      renderItem={amendment => <AmendmentSelectCard amendment={amendment} />}
                      getItemId={amendment => amendment.id}
                    />
                    <p className="text-sm text-muted-foreground">
                      Optional: Link this vote to a specific amendment
                    </p>
                  </div>
                </div>
              </CarouselItem>
            )}
            {data.type === 'election' && (
              <CarouselItem>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <Label className="text-lg">
                      Which position is this election for? (optional)
                    </Label>
                    <TypeAheadSelect
                      items={userPositions}
                      value={data.positionId}
                      onChange={value => setFormData({ ...formData, positionId: value })}
                      placeholder="Search for a position..."
                      searchKeys={['title', 'description']}
                      renderItem={position => <PositionSelectCard position={position} />}
                      getItemId={position => position.id}
                    />
                    <p className="text-sm text-muted-foreground">
                      Optional: Link this election to a specific position
                    </p>
                  </div>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !data.eventId} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !data.title.trim() || !data.eventId}
            >
              {isSubmitting ? 'Creating...' : 'Create Agenda Item'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ====== ELECTION FORMS ======
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CreateElectionForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    majorityType: 'relative' as 'absolute' | 'relative',
    isMultipleChoice: false,
    maxSelections: '',
    agendaItemId: '',
    positionId: '', // Add position field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  // Query available agenda items for elections
  const { data: agendaData } = db.useQuery({
    agendaItems: {
      $: {
        where: {
          type: 'election',
        },
      },
    },
  });

  // Query available positions
  const { data: positionsData } = db.useQuery({
    positions: {},
  });

  const userElectionAgendaItems = agendaData?.agendaItems || [];
  const allPositions = positionsData?.positions || [];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an election');
        setIsSubmitting(false);
        return;
      }

      if (!formData.agendaItemId) {
        toast.error('Please select an agenda item for this election');
        setIsSubmitting(false);
        return;
      }

      const electionId = id();
      const now = new Date();

      const electionTx = tx.elections[electionId]
        .update({
          title: formData.title,
          description: formData.description || '',
          majorityType: formData.majorityType,
          isMultipleChoice: formData.isMultipleChoice,
          maxSelections: formData.maxSelections ? parseInt(formData.maxSelections) : null,
          votingStartTime: null,
          votingEndTime: null,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        })
        .link({
          agendaItem: formData.agendaItemId,
        });

      // Link to position if selected
      if (formData.positionId) {
        electionTx.link({ position: formData.positionId });
      }

      await db.transact([electionTx]);

      toast.success('Election created successfully!');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Failed to create election:', error);
      toast.error('Failed to create election. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Election</CardTitle>
        <CardDescription>Set up an election with candidates for voting</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="election-agenda">Agenda Item</Label>
            <TypeAheadSelect
              items={userElectionAgendaItems}
              value={formData.agendaItemId}
              onChange={value => setFormData({ ...formData, agendaItemId: value })}
              placeholder="Search for an agenda item..."
              searchKeys={['title', 'description']}
              renderItem={item => <AgendaItemSelectCard agendaItem={item} />}
              getItemId={item => item.id}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="election-position">Position (optional)</Label>
            <TypeAheadSelect
              items={allPositions}
              value={formData.positionId}
              onChange={value => setFormData({ ...formData, positionId: value })}
              placeholder="Search for a position..."
              searchKeys={['title', 'description']}
              renderItem={position => <PositionSelectCard position={position} />}
              getItemId={position => position.id}
            />
            <p className="text-sm text-muted-foreground">
              Link this election to a specific position being elected
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="election-title">Title</Label>
            <Input
              id="election-title"
              placeholder="Enter election title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="election-description">Description</Label>
            <Textarea
              id="election-description"
              placeholder="Describe this election (optional)"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="election-majority">Majority Type</Label>
            <select
              id="election-majority"
              value={formData.majorityType}
              onChange={e =>
                setFormData({
                  ...formData,
                  majorityType: e.target.value as typeof formData.majorityType,
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="relative">Relative Majority (Most votes wins)</option>
              <option value="absolute">Absolute Majority (50%+ required)</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="election-multiple"
              checked={formData.isMultipleChoice}
              onCheckedChange={checked => setFormData({ ...formData, isMultipleChoice: checked })}
            />
            <Label htmlFor="election-multiple" className="cursor-pointer">
              Allow multiple selections
            </Label>
          </div>
          {formData.isMultipleChoice && (
            <div className="space-y-2">
              <Label htmlFor="election-max">Maximum selections</Label>
              <Input
                id="election-max"
                type="number"
                min="2"
                placeholder="Enter maximum number of selections"
                value={formData.maxSelections}
                onChange={e => setFormData({ ...formData, maxSelections: e.target.value })}
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Election'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function GuidedElectionFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const { data: agendaData } = db.useQuery({
    agendaItems: {
      $: {
        where: {
          type: 'election',
        },
      },
    },
  });

  // Query available positions
  const { data: positionsData } = db.useQuery({
    positions: {},
  });

  const userElectionAgendaItems = agendaData?.agendaItems || [];
  const allPositions = positionsData?.positions || [];

  const data = {
    title: formData.title || '',
    description: formData.description || '',
    majorityType: formData.majorityType || ('relative' as 'absolute' | 'relative'),
    isMultipleChoice: formData.isMultipleChoice || false,
    maxSelections: formData.maxSelections || '',
    agendaItemId: formData.agendaItemId || '',
    positionId: formData.positionId || '',
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleKeyDown = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && api?.canScrollNext()) {
      e.preventDefault();
      api.scrollNext();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an election');
        return;
      }

      if (!data.agendaItemId) {
        toast.error('Please select an agenda item for this election');
        return;
      }

      const electionId = id();
      const now = new Date();

      const electionTx = tx.elections[electionId]
        .update({
          title: data.title,
          description: data.description || '',
          majorityType: data.majorityType,
          isMultipleChoice: data.isMultipleChoice,
          maxSelections: data.maxSelections ? parseInt(data.maxSelections) : null,
          votingStartTime: null,
          votingEndTime: null,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        })
        .link({
          agendaItem: data.agendaItemId,
        });

      // Link to position if selected
      if (data.positionId) {
        electionTx.link({ position: data.positionId });
      }

      await db.transact([electionTx]);

      toast.success('Election created successfully!');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Failed to create election:', error);
      toast.error('Failed to create election. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Election</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">Which agenda item is this election for?</Label>
                  <TypeAheadSelect
                    items={userElectionAgendaItems}
                    value={data.agendaItemId}
                    onChange={value => setFormData({ ...formData, agendaItemId: value })}
                    placeholder="Search for an agenda item..."
                    searchKeys={['title', 'description']}
                    renderItem={item => <AgendaItemSelectCard agendaItem={item} />}
                    getItemId={item => item.id}
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose which election agenda item this belongs to
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">
                    Is this election for a specific position? (optional)
                  </Label>
                  <TypeAheadSelect
                    items={allPositions}
                    value={data.positionId}
                    onChange={value => setFormData({ ...formData, positionId: value })}
                    placeholder="Search for a position..."
                    searchKeys={['title', 'description']}
                    renderItem={position => <PositionSelectCard position={position} />}
                    getItemId={position => position.id}
                  />
                  <p className="text-sm text-muted-foreground">
                    Link this election to a specific position being elected
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-election-title" className="text-lg">
                    What's the election title?
                  </Label>
                  <Input
                    id="guided-election-title"
                    placeholder="Enter election title"
                    value={data.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, data.title.trim() !== '')}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be clear about what position or decision is being voted on
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-4">
                  <Label className="text-lg">Election Settings</Label>
                  <div className="space-y-2">
                    <Label htmlFor="guided-election-majority">Majority Type</Label>
                    <select
                      id="guided-election-majority"
                      value={data.majorityType}
                      onChange={e => setFormData({ ...formData, majorityType: e.target.value })}
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="relative">Relative Majority (Most votes wins)</option>
                      <option value="absolute">Absolute Majority (50%+ required)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Multiple Selections</p>
                      <p className="text-sm text-muted-foreground">
                        Allow voters to select multiple candidates
                      </p>
                    </div>
                    <Switch
                      checked={data.isMultipleChoice}
                      onCheckedChange={checked =>
                        setFormData({ ...formData, isMultipleChoice: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !data.agendaItemId} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !data.title.trim() || !data.agendaItemId}
            >
              {isSubmitting ? 'Creating...' : 'Create Election'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ====== AMENDMENT VOTE FORMS ======
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CreateAmendmentVoteForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalText: '',
    proposedText: '',
    justification: '',
    agendaItemId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  // Query available agenda items for votes
  const { data: agendaData } = db.useQuery({
    agendaItems: {
      $: {
        where: {
          type: 'vote',
        },
      },
    },
  });

  const userVoteAgendaItems = agendaData?.agendaItems || [];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an amendment vote');
        setIsSubmitting(false);
        return;
      }

      if (!formData.agendaItemId) {
        toast.error('Please select an agenda item for this amendment vote');
        setIsSubmitting(false);
        return;
      }

      const amendmentVoteId = id();
      const now = new Date();

      await db.transact([
        tx.amendmentVotes[amendmentVoteId].update({
          title: formData.title,
          description: formData.description || '',
          originalText: formData.originalText || '',
          proposedText: formData.proposedText,
          justification: formData.justification || '',
          status: 'draft',
          votingStartTime: null,
          votingEndTime: null,
          createdAt: now,
          updatedAt: now,
        }),
        tx.amendmentVotes[amendmentVoteId].link({
          agendaItem: formData.agendaItemId,
          creator: user.id,
        }),
      ]);

      toast.success('Amendment vote created successfully!');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Failed to create amendment vote:', error);
      toast.error('Failed to create amendment vote. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Amendment Vote</CardTitle>
        <CardDescription>Create a votable amendment with proposed changes</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amendment-vote-agenda">Agenda Item</Label>
            <TypeAheadSelect
              items={userVoteAgendaItems}
              value={formData.agendaItemId}
              onChange={value => setFormData({ ...formData, agendaItemId: value })}
              placeholder="Search for a vote agenda item..."
              searchKeys={['title', 'description']}
              renderItem={item => <AgendaItemSelectCard agendaItem={item} />}
              getItemId={item => item.id}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amendment-vote-title">Title</Label>
            <Input
              id="amendment-vote-title"
              placeholder="Enter amendment title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amendment-vote-description">Description</Label>
            <Textarea
              id="amendment-vote-description"
              placeholder="Describe this amendment (optional)"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amendment-vote-original">Original Text (optional)</Label>
            <Textarea
              id="amendment-vote-original"
              placeholder="Enter the current/original text"
              value={formData.originalText}
              onChange={e => setFormData({ ...formData, originalText: e.target.value })}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amendment-vote-proposed">Proposed Text</Label>
            <Textarea
              id="amendment-vote-proposed"
              placeholder="Enter the proposed new text"
              value={formData.proposedText}
              onChange={e => setFormData({ ...formData, proposedText: e.target.value })}
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amendment-vote-justification">Justification (optional)</Label>
            <Textarea
              id="amendment-vote-justification"
              placeholder="Explain why this change is needed"
              value={formData.justification}
              onChange={e => setFormData({ ...formData, justification: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Amendment Vote'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function GuidedAmendmentVoteFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const { data: agendaData } = db.useQuery({
    agendaItems: {
      $: {
        where: {
          type: 'vote',
        },
      },
    },
  });

  const userVoteAgendaItems = agendaData?.agendaItems || [];

  const data = {
    title: formData.title || '',
    description: formData.description || '',
    originalText: formData.originalText || '',
    proposedText: formData.proposedText || '',
    justification: formData.justification || '',
    agendaItemId: formData.agendaItemId || '',
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an amendment vote');
        return;
      }

      if (!data.agendaItemId) {
        toast.error('Please select an agenda item for this amendment vote');
        return;
      }

      const amendmentVoteId = id();
      const now = new Date();

      await db.transact([
        tx.amendmentVotes[amendmentVoteId].update({
          title: data.title,
          description: data.description || '',
          originalText: data.originalText || '',
          proposedText: data.proposedText,
          justification: data.justification || '',
          status: 'draft',
          votingStartTime: null,
          votingEndTime: null,
          createdAt: now,
          updatedAt: now,
        }),
        tx.amendmentVotes[amendmentVoteId].link({
          agendaItem: data.agendaItemId,
          creator: user.id,
        }),
      ]);

      toast.success('Amendment vote created successfully!');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Failed to create amendment vote:', error);
      toast.error('Failed to create amendment vote. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Amendment Vote</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-amendment-vote-agenda" className="text-lg">
                    Which agenda item is this amendment for?
                  </Label>
                  <TypeAheadSelect
                    items={userVoteAgendaItems}
                    value={data.agendaItemId}
                    onChange={value => setFormData({ ...formData, agendaItemId: value })}
                    placeholder="Search for a vote agenda item..."
                    searchKeys={['title', 'description']}
                    renderItem={item => <AgendaItemSelectCard agendaItem={item} />}
                    getItemId={item => item.id}
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose which vote agenda item this amendment belongs to
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-amendment-vote-title" className="text-lg">
                    What's the amendment title?
                  </Label>
                  <Input
                    id="guided-amendment-vote-title"
                    placeholder="Enter amendment title"
                    value={data.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    Be clear about what is being amended or proposed
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-amendment-vote-proposed" className="text-lg">
                    What is the proposed text?
                  </Label>
                  <Textarea
                    id="guided-amendment-vote-proposed"
                    placeholder="Enter the proposed new text"
                    value={data.proposedText}
                    onChange={e => setFormData({ ...formData, proposedText: e.target.value })}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is what will be voted on - the proposed change or new text
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !data.agendaItemId} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !data.title.trim() ||
                !data.agendaItemId ||
                !data.proposedText.trim()
              }
            >
              {isSubmitting ? 'Creating...' : 'Create Amendment Vote'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ====== CHANGE REQUEST FORMS ======
function CreateChangeRequestForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposedChange: '',
    justification: '',
    amendmentId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  // Query available amendment votes for the dropdown
  const { data: amendmentVotesData } = db.useQuery({
    amendmentVotes: {},
  });

  const userAmendmentVotes = amendmentVotesData?.amendmentVotes || [];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a change request');
        setIsSubmitting(false);
        return;
      }

      if (!formData.amendmentId) {
        toast.error('Please select an amendment for this change request');
        setIsSubmitting(false);
        return;
      }

      const changeRequestId = id();
      const now = new Date();

      await db.transact([
        tx.changeRequests[changeRequestId].update({
          title: formData.title,
          description: formData.description,
          proposedChange: formData.proposedChange,
          justification: formData.justification || '',
          status: 'proposed',
          votingStartTime: null,
          votingEndTime: null,
          createdAt: now,
          updatedAt: now,
        }),
        tx.changeRequests[changeRequestId].link({
          amendmentVote: formData.amendmentId,
          creator: user.id,
        }),
      ]);

      toast.success('Change request created successfully!');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Failed to create change request:', error);
      toast.error('Failed to create change request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Change Request</CardTitle>
        <CardDescription>Propose a change to an existing amendment</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="change-request-amendment">Amendment</Label>
            <TypeAheadSelect
              items={userAmendmentVotes}
              value={formData.amendmentId}
              onChange={value => setFormData({ ...formData, amendmentId: value })}
              placeholder="Search for an amendment..."
              searchKeys={['title', 'description']}
              renderItem={amendment => <AmendmentVoteSelectCard amendmentVote={amendment} />}
              getItemId={amendment => amendment.id}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="change-request-title">Title</Label>
            <Input
              id="change-request-title"
              placeholder="Enter change request title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="change-request-description">Description</Label>
            <Textarea
              id="change-request-description"
              placeholder="Describe this change request"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="change-request-proposed">Proposed Change</Label>
            <Textarea
              id="change-request-proposed"
              placeholder="Enter the proposed change"
              value={formData.proposedChange}
              onChange={e => setFormData({ ...formData, proposedChange: e.target.value })}
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="change-request-justification">Justification (optional)</Label>
            <Textarea
              id="change-request-justification"
              placeholder="Explain why this change is needed"
              value={formData.justification}
              onChange={e => setFormData({ ...formData, justification: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Change Request'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function GuidedChangeRequestFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const { data: amendmentVotesData } = db.useQuery({
    amendmentVotes: {},
  });

  const userAmendmentVotes = amendmentVotesData?.amendmentVotes || [];

  const data = {
    title: formData.title || '',
    description: formData.description || '',
    proposedChange: formData.proposedChange || '',
    justification: formData.justification || '',
    amendmentId: formData.amendmentId || '',
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleKeyDown = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && api?.canScrollNext()) {
      e.preventDefault();
      api.scrollNext();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a change request');
        return;
      }

      if (!data.amendmentId) {
        toast.error('Please select an amendment for this change request');
        return;
      }

      const changeRequestId = id();
      const now = new Date();

      await db.transact([
        tx.changeRequests[changeRequestId].update({
          title: data.title,
          description: data.description,
          proposedChange: data.proposedChange,
          justification: data.justification || '',
          status: 'proposed',
          votingStartTime: null,
          votingEndTime: null,
          createdAt: now,
          updatedAt: now,
        }),
        tx.changeRequests[changeRequestId].link({
          amendmentVote: data.amendmentId,
          creator: user.id,
        }),
      ]);

      toast.success('Change request created successfully!');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Failed to create change request:', error);
      toast.error('Failed to create change request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Change Request</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">Which amendment is this change request for?</Label>
                  <TypeAheadSelect
                    items={userAmendmentVotes}
                    value={data.amendmentId}
                    onChange={value => setFormData({ ...formData, amendmentId: value })}
                    placeholder="Search for an amendment..."
                    searchKeys={['title', 'description']}
                    renderItem={amendment => <AmendmentVoteSelectCard amendmentVote={amendment} />}
                    getItemId={amendment => amendment.id}
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose which amendment you want to propose changes to
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-change-request-title" className="text-lg">
                    What's the title of your change request?
                  </Label>
                  <Input
                    id="guided-change-request-title"
                    placeholder="Enter change request title"
                    value={data.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, data.title.trim() !== '')}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be clear about what you want to change
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-change-request-description" className="text-lg">
                    Describe this change request
                  </Label>
                  <Textarea
                    id="guided-change-request-description"
                    placeholder="Describe this change request"
                    value={data.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Explain the context and need for this change
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-change-request-proposed" className="text-lg">
                    What is the proposed change?
                  </Label>
                  <Textarea
                    id="guided-change-request-proposed"
                    placeholder="Enter the proposed change"
                    value={data.proposedChange}
                    onChange={e => setFormData({ ...formData, proposedChange: e.target.value })}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Describe the specific changes you are proposing
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-change-request-justification" className="text-lg">
                    Justification (optional)
                  </Label>
                  <Textarea
                    id="guided-change-request-justification"
                    placeholder="Explain why this change is needed"
                    value={data.justification}
                    onChange={e => setFormData({ ...formData, justification: e.target.value })}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Provide reasoning for this change
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !data.amendmentId} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !data.title.trim() ||
                !data.amendmentId ||
                !data.proposedChange.trim()
              }
            >
              {isSubmitting ? 'Creating...' : 'Create Change Request'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ====== ELECTION CANDIDATE FORMS ======
function CreateElectionCandidateForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageURL: '',
    order: 1,
    electionId: '',
    userId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  // Query available elections for the dropdown
  const { data: electionsData } = db.useQuery({
    elections: {},
  });

  const userElections = electionsData?.elections || [];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an election candidate');
        setIsSubmitting(false);
        return;
      }

      if (!formData.electionId) {
        toast.error('Please select an election for this candidate');
        setIsSubmitting(false);
        return;
      }

      const candidateId = id();
      const now = new Date();

      const transactions = [
        tx.electionCandidates[candidateId].update({
          name: formData.name,
          description: formData.description || '',
          imageURL: formData.imageURL || '',
          order: formData.order,
          createdAt: now,
        }),
        tx.electionCandidates[candidateId].link({
          election: formData.electionId,
        }),
      ];

      // Optionally link to a user if userId is provided
      if (formData.userId) {
        transactions.push(
          tx.electionCandidates[candidateId].link({
            user: formData.userId,
          })
        );
      }

      await db.transact(transactions);

      toast.success('Election candidate created successfully!');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Failed to create election candidate:', error);
      toast.error('Failed to create election candidate. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Election Candidate</CardTitle>
        <CardDescription>Add a candidate to an election</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="election-candidate-election">Election</Label>
            <TypeAheadSelect
              items={userElections}
              value={formData.electionId}
              onChange={value => setFormData({ ...formData, electionId: value })}
              placeholder="Search for an election..."
              searchKeys={['title', 'description']}
              renderItem={election => <ElectionSelectCard election={election} />}
              getItemId={election => election.id}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="election-candidate-name">Name</Label>
            <Input
              id="election-candidate-name"
              placeholder="Enter candidate name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="election-candidate-description">Description</Label>
            <Textarea
              id="election-candidate-description"
              placeholder="Describe the candidate (optional)"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="election-candidate-imageURL">Image URL (optional)</Label>
            <Input
              id="election-candidate-imageURL"
              placeholder="Enter image URL"
              value={formData.imageURL}
              onChange={e => setFormData({ ...formData, imageURL: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="election-candidate-order">Order</Label>
            <Input
              id="election-candidate-order"
              type="number"
              min="1"
              placeholder="1"
              value={formData.order}
              onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Election Candidate'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function GuidedElectionCandidateFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const { data: electionsData } = db.useQuery({
    elections: {},
  });

  const userElections = electionsData?.elections || [];

  const data = {
    name: formData.name || '',
    description: formData.description || '',
    imageURL: formData.imageURL || '',
    order: formData.order || 1,
    electionId: formData.electionId || '',
    userId: formData.userId || '',
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleKeyDown = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && api?.canScrollNext()) {
      e.preventDefault();
      api.scrollNext();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create an election candidate');
        return;
      }

      if (!data.electionId) {
        toast.error('Please select an election for this candidate');
        return;
      }

      const candidateId = id();
      const now = new Date();

      const transactions = [
        tx.electionCandidates[candidateId].update({
          name: data.name,
          description: data.description || '',
          imageURL: data.imageURL || '',
          order: data.order,
          createdAt: now,
        }),
        tx.electionCandidates[candidateId].link({
          election: data.electionId,
        }),
      ];

      if (data.userId) {
        transactions.push(
          tx.electionCandidates[candidateId].link({
            user: data.userId,
          })
        );
      }

      await db.transact(transactions);

      toast.success('Election candidate created successfully!');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Failed to create election candidate:', error);
      toast.error('Failed to create election candidate. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Election Candidate</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">Which election is this candidate for?</Label>
                  <TypeAheadSelect
                    items={userElections}
                    value={data.electionId}
                    onChange={value => setFormData({ ...formData, electionId: value })}
                    placeholder="Search for an election..."
                    searchKeys={['title', 'description']}
                    renderItem={election => <ElectionSelectCard election={election} />}
                    getItemId={election => election.id}
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose which election this candidate will participate in
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-election-candidate-name" className="text-lg">
                    What's the candidate's name?
                  </Label>
                  <Input
                    id="guided-election-candidate-name"
                    placeholder="Enter candidate name"
                    value={data.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, data.name.trim() !== '')}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the full name of the candidate
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-election-candidate-description" className="text-lg">
                    Describe the candidate (optional)
                  </Label>
                  <Textarea
                    id="guided-election-candidate-description"
                    placeholder="Enter candidate description or qualifications"
                    value={data.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Add background information or qualifications
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-election-candidate-imageURL" className="text-lg">
                    Image URL (optional)
                  </Label>
                  <Input
                    id="guided-election-candidate-imageURL"
                    placeholder="Enter image URL"
                    value={data.imageURL}
                    onChange={e => setFormData({ ...formData, imageURL: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Provide a URL for the candidate's photo
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-election-candidate-order" className="text-lg">
                    Display Order
                  </Label>
                  <Input
                    id="guided-election-candidate-order"
                    type="number"
                    min="1"
                    value={data.order}
                    onChange={e =>
                      setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                    }
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Order in which this candidate appears in the list
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !data.electionId} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !data.name.trim() || !data.electionId}
            >
              {isSubmitting ? 'Creating...' : 'Create Election Candidate'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ====== POSITION FORMS ======
function CreatePositionForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    term: 12,
    firstTermStart: '',
    groupId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  // Fetch user's owned/admin groups
  const { data, isLoading } = db.useQuery({
    groups: {
      $: {
        where: {
          'owner.id': user?.id,
        },
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a position');
        setIsSubmitting(false);
        return;
      }

      if (!formData.groupId) {
        toast.error('Please select a group');
        setIsSubmitting(false);
        return;
      }

      const positionId = id();

      await db.transact([
        tx.positions[positionId]
          .update({
            title: formData.title,
            description: formData.description || '',
            term: formData.term,
            firstTermStart: new Date(formData.firstTermStart),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .link({ group: formData.groupId }),
      ]);

      toast.success('Position created successfully!');
      setTimeout(() => {
        window.location.href = `/group/${formData.groupId}`;
      }, 500);
    } catch (error) {
      console.error('Failed to create position:', error);
      toast.error('Failed to create position. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Position</CardTitle>
        <CardDescription>Create an elected position within a group</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position-group">Group</Label>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading groups...</p>
            ) : data?.groups && data.groups.length > 0 ? (
              <TypeAheadSelect
                items={data.groups}
                value={formData.groupId}
                onChange={value => setFormData({ ...formData, groupId: value })}
                placeholder="Search for a group..."
                searchKeys={['name', 'description']}
                renderItem={group => <GroupSelectCard group={group} />}
                getItemId={group => group.id}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No groups found. You need to create or own a group first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position-title">Position Title</Label>
            <Input
              id="position-title"
              placeholder="e.g., President, Secretary, Treasurer"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position-description">Description</Label>
            <Textarea
              id="position-description"
              placeholder="Describe the responsibilities and role"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position-term">Term Length (months)</Label>
            <Input
              id="position-term"
              type="number"
              min="1"
              max="120"
              value={formData.term}
              onChange={e => setFormData({ ...formData, term: parseInt(e.target.value) })}
              required
            />
            <p className="text-sm text-muted-foreground">
              How long does each term last? (e.g., 6 = 6 months, 12 = 1 year, 24 = 2 years)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position-firstTermStart">First Term Start Date</Label>
            <Input
              id="position-firstTermStart"
              type="date"
              value={formData.firstTermStart}
              onChange={e => setFormData({ ...formData, firstTermStart: e.target.value })}
              required
            />
            <p className="text-sm text-muted-foreground">
              When did or will the first term for this position start?
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !data?.groups || data.groups.length === 0}
          >
            {isSubmitting ? 'Creating...' : 'Create Position'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function GuidedPositionFlow({
  formData,
  setFormData,
  onBack,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  // Fetch user's owned/admin groups
  const { data, isLoading } = db.useQuery({
    groups: {
      $: {
        where: {
          'owner.id': user?.id,
        },
      },
    },
  });

  const positionData = {
    title: formData.title || '',
    description: formData.description || '',
    term: formData.term || 12,
    firstTermStart: formData.firstTermStart || '',
    groupId: formData.groupId || '',
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleKeyDown = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && api && api.canScrollNext()) {
      e.preventDefault();
      api.scrollNext();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a position');
        return;
      }

      if (!positionData.groupId) {
        toast.error('Please select a group');
        setIsSubmitting(false);
        return;
      }

      const positionId = id();

      await db.transact([
        tx.positions[positionId]
          .update({
            title: positionData.title,
            description: positionData.description || '',
            term: positionData.term,
            firstTermStart: new Date(positionData.firstTermStart),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .link({ group: positionData.groupId }),
      ]);

      toast.success('Position created successfully!');
      setTimeout(() => (window.location.href = `/group/${positionData.groupId}`), 500);
    } catch (error) {
      console.error('Failed to create position:', error);
      toast.error('Failed to create position. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Position</CardTitle>
        <CardDescription>
          Step {current + 1} of {count}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label className="text-lg">Which group is this position for?</Label>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading groups...</p>
                  ) : data?.groups && data.groups.length > 0 ? (
                    <TypeAheadSelect
                      items={data.groups}
                      value={positionData.groupId}
                      onChange={value => setFormData({ ...formData, groupId: value })}
                      placeholder="Search for a group..."
                      searchKeys={['name', 'description']}
                      renderItem={group => <GroupSelectCard group={group} />}
                      getItemId={group => group.id}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No groups found. You need to create or own a group first.
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Choose which group this position belongs to
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-position-title" className="text-lg">
                    What's the position title?
                  </Label>
                  <Input
                    id="guided-position-title"
                    placeholder="e.g., President, Secretary, Treasurer"
                    value={positionData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, positionData.title.trim() !== '')}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Press Enter to continue • Name the elected position
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-position-description" className="text-lg">
                    Describe the position (optional)
                  </Label>
                  <Textarea
                    id="guided-position-description"
                    placeholder="Describe the responsibilities and role"
                    value={positionData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, true)}
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: Explain the responsibilities
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-position-term" className="text-lg">
                    How long is each term?
                  </Label>
                  <Input
                    id="guided-position-term"
                    type="number"
                    min="1"
                    max="120"
                    value={positionData.term}
                    onChange={e => setFormData({ ...formData, term: parseInt(e.target.value) })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Term length in months (e.g., 6 = 6 months, 12 = 1 year, 24 = 2 years)
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="guided-position-firstTermStart" className="text-lg">
                    When does/did the first term start?
                  </Label>
                  <Input
                    id="guided-position-firstTermStart"
                    type="date"
                    value={positionData.firstTermStart}
                    onChange={e => setFormData({ ...formData, firstTermStart: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    The start date of the first term for this position
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="absolute -left-12 right-12 top-1/2 flex -translate-y-1/2 justify-between">
            <CarouselPrevious />
            <CarouselNext disabled={current === 0 && !positionData.groupId} />
          </div>
        </Carousel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Change Type
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          {current === count - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !positionData.title.trim() ||
                !positionData.groupId ||
                !positionData.firstTermStart
              }
            >
              {isSubmitting ? 'Creating...' : 'Create Position'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
