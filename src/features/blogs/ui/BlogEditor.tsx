'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import db from '../../../../db/db';

interface BlogEditorProps {
  blogId: string;
}

export function BlogEditor({ blogId }: BlogEditorProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch blog data
  const { data, isLoading } = db.useQuery({
    blogs: {
      $: { where: { id: blogId } },
    },
  });

  const blog = data?.blogs?.[0];

  // Initialize content when blog loads
  useEffect(() => {
    if (blog?.content) {
      setContent(blog.content);
    }
  }, [blog]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await db.transact([
        db.tx.blogs[blogId].update({
          content,
        }),
      ]);
      toast.success('Blog content saved successfully');
    } catch (error) {
      console.error('Error saving blog content:', error);
      toast.error('Failed to save blog content');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading blog editor...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-semibold">Blog not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Editor</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{blog.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="content">Blog Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content here..."
              rows={20}
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
