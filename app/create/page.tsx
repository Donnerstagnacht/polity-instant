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
import { Users, FileText, BookOpen, Scale, List, Layers, CheckSquare } from 'lucide-react';
import { db, tx, id } from '@/../../db.ts';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';

type ItemType = 'groups' | 'statements' | 'blogs' | 'amendments' | 'todos' | null;

export default function CreatePage() {
  const [isCarouselMode, setIsCarouselMode] = useState(false);
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Groups
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
          </TabsList>

          <TabsContent value="groups">
            <CreateGroupForm isCarouselMode={false} />
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
    case 'statements':
      return <GuidedStatementFlow {...commonProps} />;
    case 'blogs':
      return <GuidedBlogFlow {...commonProps} />;
    case 'amendments':
      return <GuidedAmendmentFlow {...commonProps} />;
    case 'todos':
      return <GuidedTodoFlow {...commonProps} />;
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
      await db.transact([
        tx.groups[groupId].update({
          name: data.name,
          description: data.description || '',
          isPublic: data.isPublic,
          memberCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        tx.groups[groupId].link({ owner: user.id }),
        tx.groupMemberships[membershipId].update({ role: 'owner', joinedAt: new Date() }),
        tx.groupMemberships[membershipId].link({ group: groupId, user: user.id }),
      ]);
      toast.success('Group created successfully!');
      setTimeout(() => (window.location.href = '/'), 500);
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

  const data = { text: formData.text || '', tag: formData.tag || '' };

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
        tx.statements[statementId].update({ text: data.text, tag: data.tag }),
        tx.statements[statementId].link({ user: user.id }),
      ]);
      toast.success('Statement created successfully!');
      setTimeout(() => (window.location.href = '/'), 500);
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
      await db.transact([
        tx.blogs[blogId].update({ title: data.title, date: data.date, likes: 0, comments: 0 }),
        tx.blogs[blogId].link({ user: user.id }),
      ]);
      toast.success('Blog post created successfully!');
      setTimeout(() => (window.location.href = '/'), 500);
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
      await db.transact([
        tx.amendments[amendmentId].update({
          title: data.title,
          subtitle: data.subtitle || '',
          status: data.status,
          supporters: 0,
          date: data.date,
          code: data.code || '',
        }),
        tx.amendments[amendmentId].link({ user: user.id }),
      ]);
      toast.success('Amendment created successfully!');
      setTimeout(() => (window.location.href = '/'), 500);
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
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

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

      await db.transact([
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
      ]);

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

  const data = {
    title: formData.title || '',
    description: formData.description || '',
    status: formData.status || ('pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled'),
    priority: formData.priority || ('medium' as 'low' | 'medium' | 'high' | 'urgent'),
    dueDate: formData.dueDate || '',
    tags: formData.tags || ([] as string[]),
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

      await db.transact([
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
        }),
        tx.todos[todoId].link({ creator: user.id }),
        tx.todoAssignments[assignmentId].update({
          assignedAt: now,
          role: 'assignee',
        }),
        tx.todoAssignments[assignmentId].link({ todo: todoId, user: user.id }),
      ]);

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

      await db.transact([
        tx.groups[groupId].update({
          name: formData.name,
          description: formData.description || '',
          isPublic: formData.isPublic,
          memberCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        tx.groups[groupId].link({ owner: user.id }),
        tx.groupMemberships[membershipId].update({
          role: 'owner',
          joinedAt: new Date(),
        }),
        tx.groupMemberships[membershipId].link({
          group: groupId,
          user: user.id,
        }),
      ]);

      toast.success('Group created successfully!');
      setTimeout(() => {
        window.location.href = '/';
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
        }),
        tx.statements[statementId].link({ user: user.id }),
      ]);

      toast.success('Statement created successfully!');
      setTimeout(() => {
        window.location.href = '/';
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

      await db.transact([
        tx.blogs[blogId].update({
          title: formData.title,
          date: formData.date,
          likes: 0,
          comments: 0,
        }),
        tx.blogs[blogId].link({ user: user.id }),
      ]);

      toast.success('Blog post created successfully!');
      setTimeout(() => {
        window.location.href = '/';
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

// ====== AMENDMENT FORMS ======
function CreateAmendmentForm({ isCarouselMode }: { isCarouselMode: boolean }) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    status: 'Drafting',
    code: '',
    date: new Date().toISOString().split('T')[0],
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

      await db.transact([
        tx.amendments[amendmentId].update({
          title: formData.title,
          subtitle: formData.subtitle || '',
          status: formData.status,
          supporters: 0,
          date: formData.date,
          code: formData.code || '',
        }),
        tx.amendments[amendmentId].link({ user: user.id }),
      ]);

      toast.success('Amendment created successfully!');
      setTimeout(() => {
        window.location.href = '/';
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
