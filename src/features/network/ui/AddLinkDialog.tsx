/**
 * Add Link Dialog Component
 *
 * Dialog for adding a new link to the group.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface AddLinkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { label: string; url: string }) => void;
}

export function AddLinkDialog({ isOpen, onOpenChange, onSubmit }: AddLinkDialogProps) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ label, url });
    setLabel('');
    setUrl('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Link</DialogTitle>
            <DialogDescription>Add a link to this group's resources.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-label">Label</Label>
              <Input
                id="link-label"
                placeholder="Website, Social Media, etc."
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
