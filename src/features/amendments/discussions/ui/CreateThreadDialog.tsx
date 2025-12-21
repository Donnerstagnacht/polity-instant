import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { File, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadFile } from '@/hooks/use-upload-file';
import { createThread, uploadThreadFile } from '../utils/thread-operations';

interface CreateThreadDialogProps {
  amendmentId: string;
  userId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateThreadDialog({
  amendmentId,
  userId,
  open,
  onOpenChange,
}: CreateThreadDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, isUploading } = useUploadFile();

  const handleSubmit = async () => {
    if (!title.trim() || !userId) return;

    setIsSubmitting(true);
    try {
      // Upload file if selected
      let uploadedFileId: string | null = null;
      if (selectedFile) {
        uploadedFileId = await uploadThreadFile(selectedFile, uploadFile);
      }

      // Create thread
      await createThread(amendmentId, title, description, userId, uploadedFileId || undefined);

      toast.success('Thread created successfully');
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to create thread');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Discussion Thread</DialogTitle>
          <DialogDescription>Start a new discussion about this amendment</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter thread title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this thread is about..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="file">Attachment (Optional)</Label>
            <div className="mt-2">
              {selectedFile ? (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span className="text-sm">{selectedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 hover:bg-muted">
                  <Upload className="h-5 w-5" />
                  <span>Choose file to attach</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isUploading || !title.trim()}>
            {isUploading ? 'Uploading...' : isSubmitting ? 'Creating...' : 'Create Thread'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
