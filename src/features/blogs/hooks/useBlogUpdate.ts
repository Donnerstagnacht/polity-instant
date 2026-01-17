import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import db from '../../../../db/db';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

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
export function useBlogUpdate(blogId: string, actorId?: string) {
  const router = useRouter();

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
  const { data, isLoading } = db.useQuery({
    blogs: {
      $: { where: { id: blogId } },
      hashtags: {},
    },
  });

  const blog = data?.blogs?.[0];

  // Initialize form data when blog loads
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        description: blog.description || '',
        imageURL: blog.imageURL || '',
        isPublic: blog.isPublic ?? true,
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
        title: formData.title,
        description: formData.description,
        imageURL: formData.imageURL,
        isPublic: formData.isPublic,
      };

      const transactions: any[] = [db.tx.blogs[blogId].update(updateData)];

      // Add timeline event for public blogs
      if (formData.isPublic && actorId) {
        transactions.push(
          createTimelineEvent({
            eventType: 'updated',
            entityType: 'blog',
            entityId: blogId,
            actorId,
            title: `${formData.title} has been updated`,
            description: 'The blog post has been modified',
          })
        );
      }

      // Update blog
      await db.transact(transactions);

      // Handle hashtags - remove old and add new
      if (blog.hashtags) {
        const existingTags = blog.hashtags.map((ht: any) => ht.tag);
        const tagsToRemove = blog.hashtags.filter(
          (ht: any) => !formData.tags.includes(ht.tag)
        );
        const tagsToAdd = formData.tags.filter(tag => !existingTags.includes(tag));

        const transactions: any[] = [];

        // Remove old hashtags
        tagsToRemove.forEach((ht: any) => {
          transactions.push(db.tx.hashtags[ht.id].delete());
        });

        // Add new hashtags
        tagsToAdd.forEach(tag => {
          const hashtagId = `${blogId}_${tag}`;
          transactions.push(
            db.tx.hashtags[hashtagId].update({ tag }),
            db.tx.hashtags[hashtagId].link({ blog: blogId })
          );
        });

        if (transactions.length > 0) {
          await db.transact(transactions);
        }
      }

      toast.success('Blog updated successfully');

      setTimeout(() => {
        router.push(`/blog/${blogId}`);
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
