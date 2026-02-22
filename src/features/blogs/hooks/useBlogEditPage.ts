import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';
import { notifyBlogPublished } from '@/utils/notification-helpers';
import { computeHashtagDiff } from '../logic/blogHashtagDiff';

export interface BlogFormData {
  title: string;
  description: string;
  imageURL: string;
  isPublic: boolean;
  tags: string[];
}

/**
 * Hook for blog update functionality
 */
export function useBlogEditPage(blogId: string, actorId?: string) {
  const navigate = useNavigate();
  const { updateBlog, syncBlogHashtags } = useBlogActions();

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    description: '',
    imageURL: '',
    isPublic: true,
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch blog data
  const { blogWithHashtags } = useBlogState({ blogId, includeHashtags: true });
  const isLoading = false;

  const blog = blogWithHashtags;

  const initializedRef = useRef(false);

  // Initialize form data only once when blog first loads
  useEffect(() => {
    if (blog && !initializedRef.current) {
      initializedRef.current = true;
      setFormData({
        title: blog.title || '',
        description: blog.description || '',
        imageURL: blog.image_url || '',
        isPublic: blog.is_public ?? true,
        tags: blog.hashtags?.map((ht: any) => ht.tag) || [],
      });
    }
  }, [blog]);

  // Update a single field
  const updateField = <K extends keyof BlogFormData>(field: K, value: BlogFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Tag management
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
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

      const updateData: any = {
        id: blogId,
        title: formData.title,
        description: formData.description,
        image_url: formData.imageURL,
        is_public: formData.isPublic,
      };

      await updateBlog(updateData);

      // Timeline and notifications are server-only — send separately
      try {
        if (formData.isPublic && actorId) {
          if (formData.imageURL && formData.imageURL !== blog.image_url) {
            await createTimelineEvent({ data: {
              eventType: 'image_uploaded',
              entityType: 'blog',
              entityId: blogId,
              actorId,
              title: `${formData.title} image updated`,
              description: 'A new image was uploaded to this blog post',
              contentType: 'image',
            } });
          }
        }

        if (formData.isPublic && !blog.is_public && actorId) {
          await notifyBlogPublished({
            senderId: actorId,
            blogId,
            blogTitle: formData.title,
          });
        }
      } catch { /* timeline/notification delivery is best-effort */ }

      // Handle hashtags - remove old and add new
      if (blog.hashtags) {
        const { hashtagsToRemove, hashtagsToAdd } = computeHashtagDiff(
          blog.hashtags as any[],
          formData.tags,
          blogId
        );

        await syncBlogHashtags({ hashtagsToRemove, hashtagsToAdd });
      }

      toast.success('Blog updated successfully');

      setTimeout(() => {
        navigate({ to: `/blog/${blogId}` });
      }, 500);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
