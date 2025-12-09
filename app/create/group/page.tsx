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
import { Switch } from '@/components/ui/switch';
import { HashtagInput } from '@/components/ui/hashtag-input';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { db, tx, id } from '@/../db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function CreateGroupPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    hashtags: [] as string[],
    visibility: 'public' as 'public' | 'authenticated' | 'private',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      router.push(`/group/${groupId}`);
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create a New Group</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Carousel setApi={setCarouselApi} opts={{ watchDrag: false }}>
                <CarouselContent>
                  {/* Step 1: Basic Information */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
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
                    </div>
                  </CarouselItem>

                  {/* Step 2: Visibility Settings */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="group-public"
                          checked={formData.isPublic}
                          onCheckedChange={checked =>
                            setFormData({ ...formData, isPublic: checked })
                          }
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
                          <option value="authenticated">
                            Authenticated - Only logged-in users
                          </option>
                          <option value="private">Private - Only members</option>
                        </select>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 3: Tags */}
                  <CarouselItem>
                    <div className="space-y-4 p-4">
                      <HashtagInput
                        value={formData.hashtags}
                        onChange={hashtags => setFormData({ ...formData, hashtags })}
                        placeholder="Add hashtags (e.g., politics, community)"
                      />
                    </div>
                  </CarouselItem>

                  {/* Step 4: Review */}
                  <CarouselItem>
                    <div className="p-4">
                      <Card className="overflow-hidden border-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/50">
                        <CardHeader>
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant="default" className="text-xs">
                              Group
                            </Badge>
                            {formData.isPublic && (
                              <Badge variant="outline" className="text-xs">
                                Public
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">
                            {formData.name || 'Untitled Group'}
                          </CardTitle>
                          {formData.description && (
                            <CardDescription>{formData.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <strong>Visibility:</strong>
                            <span className="text-muted-foreground">{formData.visibility}</span>
                          </div>
                          {formData.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {formData.hashtags.map((tag, index) => (
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
                  disabled={currentStep === 0 && !formData.name}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Group'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
