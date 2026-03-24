import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
import { useCommonState, useCommonActions } from '@/zero/common';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';
import { notifyBlogPublished } from '@/features/notifications/utils/notification-helpers.ts';
import { type Visibility } from '@/features/auth/logic/checkEntityAccess';

export interface BlogFormData {
  title: string;
  description: string;
  imageURL: string;
  visibility: Visibility;
  tags: string[];
}

/**
 * Hook for blog update functionality
 */
export function useBlogEditPage(blogId: string, actorId?: string) {
  const navigate = useNavigate();
  const { updateBlog } = useBlogActions();
  const commonActions = useCommonActions();

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    description: '',
    imageURL: '',
    visibility: 'public' as Visibility,
    tags: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch blog data
  const { blogWithHashtags } = useBlogState({ blogId, includeHashtags: true });
  const { blogHashtags, allHashtags } = useCommonState({
    blog_id: blogId,
    loadAllHashtags: true,
  });
  const isLoading = false;

  const blog = blogWithHashtags;

  const initializedRef = useRef(false);
  const hashtagsInitializedRef = useRef(false);

  // Initialize form data only once when blog first loads
  useEffect(() => {
    if (blog && !initializedRef.current) {
      initializedRef.current = true;
      const existingTags = (blogHashtags ?? [])
        .map(j => j.hashtag?.tag)
        .filter((t): t is string => !!t);
      setFormData({
        title: blog.title || '',
        description: blog.description || '',
        imageURL: blog.image_url || '',
        visibility: (blog.visibility as Visibility) ?? 'public',
        tags: existingTags.length > 0 ? existingTags : [],
      });
    }
  }, [blog]);

  // Initialize hashtags from junction data once available (may load after blog)
  useEffect(() => {
    if (blogHashtags && blogHashtags.length > 0 && !hashtagsInitializedRef.current) {
      hashtagsInitializedRef.current = true;
      const tags = blogHashtags.map(j => j.hashtag?.tag).filter((t): t is string => !!t);
      setFormData(prev => ({ ...prev, tags }));
    }
  }, [blogHashtags]);

  // Update a single field
  const updateField = <K extends keyof BlogFormData>(field: K, value: BlogFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!blog) {
        toast.error('No blog data to update');
        return;
      }

      await updateBlog({
        id: blogId,
        title: formData.title,
        description: formData.description,
        image_url: formData.imageURL,
        visibility: formData.visibility,
      });

      // Timeline and notifications are server-only — send separately
      try {
        if (formData.visibility === 'public' && actorId) {
          if (formData.imageURL && formData.imageURL !== blog.image_url) {
            await createTimelineEvent({
              data: {
                eventType: 'image_uploaded',
                entityType: 'blog',
                entityId: blogId,
                actorId,
                title: `${formData.title} image updated`,
                description: 'A new image was uploaded to this blog post',
                contentType: 'image',
              },
            });
          }
        }

        if (formData.visibility === 'public' && blog.visibility !== 'public' && actorId) {
          await notifyBlogPublished({
            senderId: actorId,
            blogId,
            blogTitle: formData.title,
          });
        }
      } catch {
        /* timeline/notification delivery is best-effort */
      }

      // Sync hashtags via junction tables
      await commonActions.syncEntityHashtags(
        'blog',
        blogId,
        formData.tags,
        blogHashtags ?? [],
        allHashtags ?? []
      );

      toast.success('Blog updated successfully');
      if (blog?.group_id) {
        navigate({
          to: '/group/$id/blog/$entryId',
          params: { id: blog.group_id, entryId: blogId },
        });
      } else {
        navigate({ to: '/user/$id/blog/$entryId', params: { id: actorId || '', entryId: blogId } });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    updateField,
    handleSubmit,
    isSubmitting,
    blog,
    isLoading,
  };
}
