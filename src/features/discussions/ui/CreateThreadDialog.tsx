import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { Textarea } from '@/features/shared/ui/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/ui/dialog';
import { File, Upload, X } from 'lucide-react';
import { useUploadFile } from '@/features/file-upload/hooks/use-upload-file.ts';

interface CreateThreadDialogProps {
  amendmentId: string;
  userId?: string;
  amendmentTitle?: string;
  senderName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateThread: (
    amendmentId: string,
    title: string,
    description: string,
    userId: string,
    fileId?: string,
  ) => Promise<string>;
}

export function CreateThreadDialog({
  amendmentId,
  userId,
  amendmentTitle,
  senderName,
  open,
  onOpenChange,
  onCreateThread,
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
        try {
          const uploadResult = await uploadFile(selectedFile);
          uploadedFileId = uploadResult?.key ?? null;
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }

      // Create thread
      await onCreateThread(
        amendmentId,
        title,
        description,
        userId,
        uploadedFileId || undefined,
      );

      setTitle('');
      setDescription('');
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating thread:', error);
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
                <label className="hover:bg-muted flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4">
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
