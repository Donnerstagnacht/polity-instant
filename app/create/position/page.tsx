'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { TypeAheadSelect } from '@/components/ui/type-ahead-select';
import { GroupSelectCard } from '@/components/ui/entity-select-cards';
import { db, tx, id } from 'db/db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useTranslation } from '@/hooks/use-translation';

function CreatePositionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore(state => state.user);
  const { t } = useTranslation();

  const groupIdParam = searchParams.get('groupId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    term: 12,
    firstTermStart: '',
    groupId: groupIdParam || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    carouselApi.on('select', () => {
      setCurrentStep(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error(t('pages.create.validation.loginRequired'));
        setIsSubmitting(false);
        return;
      }

      if (!formData.groupId) {
        toast.error(t('pages.create.validation.groupRequired'));
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

      toast.success(`Position ${t('pages.create.success.created')}`);
      router.push(`/group/${formData.groupId}`);
    } catch (error) {
      console.error('Failed to create position:', error);
      toast.error(t('pages.create.error.createFailed'));
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{t('pages.create.position.title')}</CardTitle>
          </CardHeader>
            <CardContent>
              <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                <CarouselContent>
                  {/* Step 1: Group Selection */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="position-group">{t('pages.create.position.groupLabel')}</Label>
                        {isLoading ? (
                          <p className="text-sm text-muted-foreground">{t('pages.create.position.loadingGroups')}</p>
                        ) : data?.groups && data.groups.length > 0 ? (
                          <TypeAheadSelect
                            items={data.groups}
                            value={formData.groupId}
                            onChange={value => setFormData({ ...formData, groupId: value })}
                            placeholder={t('pages.create.common.searchGroup')}
                            searchKeys={['name', 'description']}
                            renderItem={group => <GroupSelectCard group={group} />}
                            getItemId={group => group.id}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {t('pages.create.common.noGroupsFound')}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position-title">{t('pages.create.position.titleLabel')}</Label>
                        <Input
                          id="position-title"
                          placeholder={t('pages.create.position.titlePlaceholder')}
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 2: Position Details */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="position-description">{t('pages.create.position.descriptionLabel')}</Label>
                        <Textarea
                          id="position-description"
                          placeholder={t('pages.create.position.descriptionPlaceholder')}
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          rows={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position-term">{t('pages.create.position.termLabel')}</Label>
                        <Input
                          id="position-term"
                          type="number"
                          min="1"
                          max="120"
                          value={formData.term}
                          onChange={e =>
                            setFormData({ ...formData, term: parseInt(e.target.value) })
                          }
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          {t('pages.create.position.termHint')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position-firstTermStart">{t('pages.create.position.firstTermStartLabel')}</Label>
                        <Input
                          id="position-firstTermStart"
                          type="date"
                          value={formData.firstTermStart}
                          onChange={e =>
                            setFormData({ ...formData, firstTermStart: e.target.value })
                          }
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          {t('pages.create.position.firstTermStartHint')}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 3: Review */}
                  <CarouselItem>
                    <div className="p-4">
                      <Card className="overflow-hidden border-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/50">
                        <CardHeader>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="default" className="text-xs">
                              {t('pages.create.position.reviewBadge')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {t('pages.create.position.termMonths', { months: formData.term })}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {formData.title || 'Untitled Position'}
                          </CardTitle>
                          {formData.description && (
                            <CardDescription>{formData.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <strong>{t('pages.create.common.group')}:</strong>
                            <span className="text-muted-foreground">
                              {data?.groups?.find(g => g.id === formData.groupId)?.name ||
                                t('pages.create.common.notSelected')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <strong>{t('pages.create.position.termLength')}</strong>
                            <span className="text-muted-foreground">{formData.term} months</span>
                          </div>
                          {formData.firstTermStart && (
                            <div className="flex items-center gap-2 text-sm">
                              <strong>{t('pages.create.position.firstTermStarts')}</strong>
                              <span className="text-muted-foreground">
                                {formData.firstTermStart}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
              <div className="mt-4 flex justify-center gap-2">
                {[0, 1, 2].map(index => (
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
              {currentStep < 2 ? (
                <Button
                  type="button"
                  onClick={() => carouselApi?.scrollNext()}
                  disabled={
                    (currentStep === 0 && !formData.title) ||
                    (currentStep === 1 && (!formData.description || !formData.term || !formData.firstTermStart)) ||
                    !data?.groups ||
                    data.groups.length === 0
                  }
                >
                  {t('pages.create.next')}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !data?.groups || data.groups.length === 0}
                >
                  {isSubmitting ? t('pages.create.creating') : t('pages.create.position.createButton')}
                </Button>
              )}
            </CardFooter>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}

export default function CreatePositionPage() {
  const { t } = useTranslation();
  
  return (
    <Suspense
      fallback={
        <PageWrapper className="flex min-h-screen items-center justify-center p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{t('pages.create.loading')}</CardTitle>
            </CardHeader>
          </Card>
        </PageWrapper>
      }
    >
      <CreatePositionForm />
    </Suspense>
  );
}
