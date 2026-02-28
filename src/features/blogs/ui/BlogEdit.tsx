/**
 * Blog Edit Component
 *
 * Complete blog editing UI with authorization checks,
 * loading states, and form management.
 */

import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { Textarea } from '@/features/shared/ui/ui/textarea';
import { Switch } from '@/features/shared/ui/ui/switch';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from '@/features/file-upload/ui/ImageUpload.tsx';
import { HashtagEditor } from '@/features/shared/ui/ui/hashtag-editor';
import { useBlogEditPage } from '../hooks/useBlogEditPage';
import { useAuth } from '@/providers/auth-provider';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface BlogEditProps {
  blogId: string;
}

export function BlogEdit({ blogId }: BlogEditProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const {
    formData,
    setFormData,
    updateField,
    handleSubmit,
    isSubmitting,
    blog,
    isLoading,
  } = useBlogEditPage(blogId, user?.id);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('features.blogs.editPage.loading')}</p>
      </div>
    );
  }

  // Not found state
  if (!blog) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold">{t('features.blogs.editPage.notFound')}</p>
          <p className="text-muted-foreground">{t('features.blogs.editPage.notFoundDescription')}</p>
          <div className="mt-6">
            <Button onClick={() => navigate({ to: '/blog' })} variant="default">
              {t('features.blogs.editPage.backToBlogs')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main edit form
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('features.blogs.editPage.title')}</h1>
        <p className="text-muted-foreground">{t('features.blogs.editPage.description')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Blog Image Section */}
        <ImageUpload
          currentImage={formData.imageURL}
          onImageChange={(url: string) => updateField('imageURL', url)}
          entityType="blogs"
          entityId={blogId}
          label={t('features.blogs.editPage.blogImage')}
          description={t('features.blogs.editPage.blogImageDescription')}
        />

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('features.blogs.editPage.basicInfo')}</CardTitle>
            <CardDescription>{t('features.blogs.editPage.basicInfoDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('features.blogs.editPage.blogTitleRequired')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder={t('features.blogs.editPage.blogTitlePlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('features.blogs.editPage.descriptionLabel')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => updateField('description', e.target.value)}
                placeholder={t('features.blogs.editPage.descriptionPlaceholder')}
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={checked => updateField('isPublic', checked)}
              />
              <Label htmlFor="isPublic">{t('features.blogs.editPage.publicBlog')}</Label>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>{t('features.blogs.editPage.tags')}</CardTitle>
            <CardDescription>{t('features.blogs.editPage.tagsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <HashtagEditor
              value={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
              placeholder={t('features.blogs.editPage.addTagPlaceholder')}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: `/blog/${blogId}` })}
            disabled={isSubmitting}
          >
            {t('features.blogs.editPage.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('features.blogs.editPage.saving')}
              </>
            ) : (
              t('features.blogs.editPage.saveChanges')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
