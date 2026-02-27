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
import { VisibilitySelector } from '@/components/ui/visibility-selector';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Calendar, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useTodoMutations } from '@/features/todos/hooks/useTodoData';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useTranslation } from '@/hooks/use-translation';

export default function CreateTodoPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { createTodo, isLoading: isSubmitting } = useTodoMutations();
  const { t } = useTranslation();

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

  const handleSubmit = async () => {
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
            <CardTitle>{t('pages.create.todo.title')}</CardTitle>
          </CardHeader>
            <CardContent>
              <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                <CarouselContent>
                  {/* Step 1: Basic Information */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="todo-title">{t('pages.create.todo.titleLabel')}</Label>
                        <Input
                          id="todo-title"
                          placeholder={t('pages.create.todo.titlePlaceholder')}
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="todo-description">{t('pages.create.todo.descriptionLabel')}</Label>
                        <Textarea
                          id="todo-description"
                          placeholder={t('pages.create.todo.descriptionPlaceholder')}
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
                        <Label htmlFor="todo-due-date">{t('pages.create.todo.dueDateOptional')}</Label>
                        <Input
                          id="todo-due-date"
                          type="date"
                          value={formData.dueDate}
                          onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>{t('pages.create.todo.priorityLabel')}</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            type="button"
                            variant={formData.priority === 'low' ? 'default' : 'outline'}
                            onClick={() => setFormData({ ...formData, priority: 'low' })}
                            className="flex items-center gap-2"
                          >
                            {formData.priority === 'low' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            {t('pages.create.todo.priority.low')}
                          </Button>
                          <Button
                            type="button"
                            variant={formData.priority === 'medium' ? 'default' : 'outline'}
                            onClick={() => setFormData({ ...formData, priority: 'medium' })}
                            className="flex items-center gap-2"
                          >
                            {formData.priority === 'medium' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Loader2 className="h-4 w-4" />
                            )}
                            {t('pages.create.todo.priority.medium')}
                          </Button>
                          <Button
                            type="button"
                            variant={formData.priority === 'high' ? 'default' : 'outline'}
                            onClick={() => setFormData({ ...formData, priority: 'high' })}
                            className="flex items-center gap-2"
                          >
                            {formData.priority === 'high' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            {t('pages.create.todo.priority.high')}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>{t('pages.create.todo.statusLabel')}</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            type="button"
                            variant={formData.status === 'todo' ? 'default' : 'outline'}
                            onClick={() => setFormData({ ...formData, status: 'todo' })}
                            className="flex items-center gap-2"
                          >
                            {formData.status === 'todo' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Calendar className="h-4 w-4" />
                            )}
                            {t('pages.create.todo.status.todo')}
                          </Button>
                          <Button
                            type="button"
                            variant={formData.status === 'in_progress' ? 'default' : 'outline'}
                            onClick={() => setFormData({ ...formData, status: 'in_progress' })}
                            className="flex items-center gap-2"
                          >
                            {formData.status === 'in_progress' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Loader2 className="h-4 w-4" />
                            )}
                            {t('pages.create.todo.status.inProgress')}
                          </Button>
                          <Button
                            type="button"
                            variant={formData.status === 'completed' ? 'default' : 'outline'}
                            onClick={() => setFormData({ ...formData, status: 'completed' })}
                            className="flex items-center gap-2"
                          >
                            {formData.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            {t('pages.create.todo.status.completed')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 3: Settings */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <TooltipProvider>
                        <VisibilitySelector
                          value={formData.visibility}
                          onChange={visibility => setFormData({ ...formData, visibility })}
                        />
                      </TooltipProvider>
                      <div className="space-y-2">
                        <Label>{t('pages.create.todo.tagsOptional')}</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder={t('pages.create.todo.tagPlaceholder')}
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
                            {t('pages.create.todo.addTag')}
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
                              {t('pages.create.todo.reviewBadge')}
                            </Badge>
                            <Badge
                              variant={formData.priority === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {t(`pages.create.todo.priorityBadge`, { priority: formData.priority })}
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
                              <span>{t('pages.create.todo.due')} {formData.dueDate}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <strong>{t('pages.create.todo.statusLabel')}:</strong>
                            <Badge variant="outline" className="text-xs">
                              {formData.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <strong>{t('pages.create.common.visibility')}:</strong>
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
                    aria-label={t('pages.create.goToStep', { step: index + 1 })}
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
                {t('pages.create.previous')}
              </Button>
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => carouselApi?.scrollNext()}
                  disabled={currentStep === 0 && !formData.title}
                >
                  {t('pages.create.next')}
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? t('pages.create.creating') : t('pages.create.todo.createButton')}
                </Button>
              )}
            </CardFooter>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
