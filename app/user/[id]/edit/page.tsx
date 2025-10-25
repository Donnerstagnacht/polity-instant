'use client';

import { use, useState, useEffect } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useUserData } from '@/features/user/hooks/useUserData';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';
import { useInstantUpload } from '@/hooks/use-instant-upload';
import { db, tx, id } from '../../../../db';
import { HashtagInput } from '@/components/ui/hashtag-input';

export default function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const { user: dbUser, profileId, isLoading, error } = useUserData(resolvedParams.id);

  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    about: '',
    email: '',
    twitter: '',
    website: '',
    location: '',
    avatar: '',
    hashtags: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadFile, isUploading } = useInstantUpload();

  // Initialize form data when user data loads
  useEffect(() => {
    if (dbUser) {
      console.log('📝 [UserEditPage] Populating form with user data:', {
        name: dbUser.name,
        subtitle: dbUser.subtitle,
        about: dbUser.about?.substring(0, 50) + '...',
        contact: dbUser.contact,
      });

      setFormData({
        name: dbUser.name || '',
        subtitle: dbUser.subtitle || '',
        about: dbUser.about || '',
        email: dbUser.contact?.email || '',
        twitter: dbUser.contact?.twitter || '',
        website: dbUser.contact?.website || '',
        location: dbUser.contact?.location || '',
        avatar: dbUser.avatar || '',
        hashtags: [], // Will be populated separately from linked hashtags
      });
    }
  }, [dbUser]);

  // Check if the current user is authorized to edit this profile
  const isAuthorized = authUser?.id === resolvedParams.id;

  console.log('🔐 [UserEditPage] Authorization check:', {
    authUserId: authUser?.id,
    paramUserId: resolvedParams.id,
    isAuthorized,
    isLoading,
    hasDbUser: !!dbUser,
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser?.id || !profileId) return;

    try {
      // Upload to InstantDB Storage using user ID as path
      const avatarPath = `${authUser.id}/avatar`;
      const result = await uploadFile(avatarPath, file, {
        contentType: file.type,
      });

      // Link the uploaded file to the profile
      if (result?.data?.id) {
        await db.transact([tx.profiles[profileId].link({ avatarFile: result.data.id })]);

        toast.success('Avatar uploaded successfully');

        // The avatar URL will be automatically updated through the real-time query
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
      console.error('Avatar upload error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!dbUser) {
        toast.error('No profile data to update');
        return;
      }

      if (!profileId) {
        toast.error('Could not find profile to update');
        return;
      }

      console.log('📝 [UserEditPage] Updating profile:', {
        profileId,
        updates: formData,
      });

      // Update the profile in Instant DB
      const transactions = [
        tx.profiles[profileId].update({
          name: formData.name,
          subtitle: formData.subtitle,
          about: formData.about,
          avatar: formData.avatar,
          contactEmail: formData.email,
          contactTwitter: formData.twitter,
          contactWebsite: formData.website,
          contactLocation: formData.location,
          updatedAt: new Date(),
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
          tx.hashtags[hashtagId].link({ user: authUser?.id ?? '' })
        );
      });

      await db.transact(transactions);

      toast.success('Profile updated successfully');

      // Wait a moment for the DB to update, then navigate
      setTimeout(() => {
        router.push(`/user/${resolvedParams.id}`);
      }, 500);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading profile data...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  // Check if user data exists after loading
  if (!dbUser) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-semibold">Profile not found</p>
              <p className="text-muted-foreground">No profile data exists for this user yet</p>
              {error && <p className="mt-2 text-sm text-red-500">Error: {error}</p>}
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  You need to create a profile first by clicking the "Seed Profile Data" button on
                  the profile page
                </p>
                <Button onClick={() => router.push(`/user/${resolvedParams.id}`)} variant="default">
                  Go to Profile Page
                </Button>
              </div>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  // Check authorization only after we have the data
  if (!isAuthorized) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-semibold text-red-500">Unauthorized</p>
              <p className="text-muted-foreground">You are not authorized to edit this profile</p>
              <Button
                variant="outline"
                onClick={() => router.push(`/user/${resolvedParams.id}`)}
                className="mt-4"
              >
                View Profile
              </Button>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper>
        <div className="container mx-auto max-w-4xl p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">Update your profile information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.avatar} alt={formData.name} />
                    <AvatarFallback>{formData.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="avatar-upload"
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                  >
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Camera className="mr-2 h-4 w-4" />
                        Change Avatar
                      </span>
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g., Constitutional Law Expert"
                  />
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>Tell others about yourself</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="about">Bio</Label>
                  <Textarea
                    id="about"
                    value={formData.about}
                    onChange={e => setFormData({ ...formData, about: e.target.value })}
                    placeholder="Write a brief description about yourself..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How people can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="@yourusername"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="text"
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a valid URL (e.g., https://example.com)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle>Hashtags</CardTitle>
                <CardDescription>Add hashtags to help others find you</CardDescription>
              </CardHeader>
              <CardContent>
                <HashtagInput
                  value={formData.hashtags}
                  onChange={hashtags => setFormData({ ...formData, hashtags })}
                  placeholder="Add hashtags (e.g., developer, activist)"
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/user/${resolvedParams.id}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
