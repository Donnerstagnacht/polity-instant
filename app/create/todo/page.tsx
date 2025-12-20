'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { Calendar } from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useTodoMutations } from '@/features/todos/hooks/useTodoData';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function CreateTodoPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { createTodo, isLoading: isSubmitting } = useTodoMutations();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in_progress' | 'completed',
    tags: [] as string[],
    visibility: 'private' as 'public' | 'authenticated' | 'private',
  });
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    carouselApi.on('select', () => {
      setCurrentStep(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      return;
    }

    const result = await createTodo({
      title: formData.title,
      description: formData.description || undefined,
      ownerId: user.id,
      priority: formData.priority,
      status: formData.status === 'todo' ? 'open' : formData.status,
      dueDate: formData.dueDate || undefined,
    });

    if (result.success) {
      router.push('/todos');
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create a New Todo</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                <CarouselContent>
                  {/* Step 1: Basic Information */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
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
                          placeholder="Describe the task"
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 2: Details */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="todo-due-date">Due Date (Optional)</Label>
                        <Input
                          id="todo-due-date"
                          type="date"
                          value={formData.dueDate}
                          onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="todo-priority">Priority</Label>
                        <select
                          id="todo-priority"
                          value={formData.priority}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              priority: e.target.value as 'low' | 'medium' | 'high',
                            })
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="todo-status">Status</Label>
                        <select
                          id="todo-status"
                          value={formData.status}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              status: e.target.value as 'todo' | 'in_progress' | 'completed',
                            })
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 3: Settings */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="todo-visibility">Visibility</Label>
                        <select
                          id="todo-visibility"
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
                          <option value="authenticated">
                            Authenticated - Only logged-in users
                          </option>
                          <option value="private">Private - Only you</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tags (Optional)</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a tag"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                          <Button type="button" variant="outline" onClick={handleAddTag}>
                            Add
                          </Button>
                        </div>
                        {formData.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm text-secondary-foreground"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="hover:text-destructive"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 4: Review */}
                  <CarouselItem>
                    <div className="p-4">
                      <Card className="overflow-hidden border-2 bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/40 dark:to-green-900/50">
                        <CardHeader>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="default" className="text-xs">
                              Todo
                            </Badge>
                            <Badge
                              variant={formData.priority === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {formData.priority} Priority
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {formData.title || 'Untitled Todo'}
                          </CardTitle>
                          {formData.description && (
                            <CardDescription>{formData.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {formData.dueDate && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {formData.dueDate}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <strong>Status:</strong>
                            <Badge variant="outline" className="text-xs">
                              {formData.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <strong>Visibility:</strong>
                            <span className="text-muted-foreground">{formData.visibility}</span>
                          </div>
                          {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {formData.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
              <div className="mt-4 flex justify-center gap-2">
                {[0, 1, 2, 3].map(index => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => carouselApi?.scrollTo(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      currentStep === index ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => carouselApi?.scrollPrev()}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => carouselApi?.scrollNext()}
                  disabled={currentStep === 0 && !formData.title}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Todo'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
