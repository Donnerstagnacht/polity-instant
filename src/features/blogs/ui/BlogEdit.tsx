/**
 * Blog Edit Component
 *
 * Complete blog editing UI with authorization checks,
 * loading states, and form management.
 */

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useBlogUpdate } from '../hooks/useBlogUpdate';
import { useAuthStore } from '@/features/auth/auth';
import { useTranslation } from '@/hooks/use-translation';

interface BlogEditProps {
  blogId: string;
}

export function BlogEdit({ blogId }: BlogEditProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const {
    formData,
    tagInput,
    setTagInput,
    updateField,
    handleAddTag,
    handleRemoveTag,
    handleSubmit,
    isSubmitting,
    blog,
    isLoading,
  } = useBlogUpdate(blogId, user?.id);

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
            <Button onClick={() => router.push(`/blog`)} variant="default">
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
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={t('features.blogs.editPage.addTagPlaceholder')}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                {t('features.blogs.editPage.add')}
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/blog/${blogId}`)}
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
