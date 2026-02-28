'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Textarea } from '@/features/shared/ui/ui/textarea';
import { Label } from '@/features/shared/ui/ui/label';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useBlogActions } from '@/zero/blogs/useBlogActions';

interface BlogEditorProps {
  blogId: string;
}

export function BlogEditor({ blogId }: BlogEditorProps) {
  const { blog } = useBlogState({ blogId });
  const { updateBlog } = useBlogActions();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize content when blog loads
  useEffect(() => {
    if (blog?.content) {
      setContent(blog.content as string);
    }
  }, [blog]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBlog({
        id: blogId,
        content,
      });
      toast.success('Blog content saved successfully');
    } catch (error) {
      console.error('Error saving blog content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading blog editor...</p>
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
