'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EditPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  form: {
    title: string;
    setTitle: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    term: string;
    setTerm: (value: string) => void;
    firstTermStart: string;
    setFirstTermStart: (value: string) => void;
  };
}

export function EditPositionDialog({
  open,
  onOpenChange,
  onSubmit,
  form,
}: EditPositionDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
            <DialogDescription>
              Update the position details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-position-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-position-title"
                placeholder="e.g., President, Secretary, Treasurer"
                value={form.title}
                onChange={(e) => form.setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-position-description">Description</Label>
              <Textarea
                id="edit-position-description"
                placeholder="Responsibilities and duties (optional)"
                value={form.description}
                onChange={(e) => form.setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-position-term">
                  Term (years) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-position-term"
                  type="number"
                  min="1"
                  placeholder="4"
                  value={form.term}
                  onChange={(e) => form.setTerm(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-position-firstTermStart">
                  First Term Start <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-position-firstTermStart"
                  type="date"
                  value={form.firstTermStart}
                  onChange={(e) => form.setFirstTermStart(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Position</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
