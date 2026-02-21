'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

interface AddPositionDialogProps {
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
    createElection: boolean;
    setCreateElection: (value: boolean) => void;
  };
}

export function AddPositionDialog({
  open,
  onOpenChange,
  onSubmit,
  form,
}: AddPositionDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Position</DialogTitle>
            <DialogDescription>
              Create a new position for this group. You can optionally create an election for this position.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="position-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="position-title"
                placeholder="e.g., President, Secretary, Treasurer"
                value={form.title}
                onChange={(e) => form.setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position-description">Description</Label>
              <Textarea
                id="position-description"
                placeholder="Responsibilities and duties (optional)"
                value={form.description}
                onChange={(e) => form.setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position-term">
                  Term (years) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="position-term"
                  type="number"
                  min="1"
                  placeholder="4"
                  value={form.term}
                  onChange={(e) => form.setTerm(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position-firstTermStart">
                  First Term Start <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="position-firstTermStart"
                  type="date"
                  value={form.firstTermStart}
                  onChange={(e) => form.setFirstTermStart(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 rounded-lg border p-4">
              <Checkbox
                id="position-createElection"
                checked={form.createElection}
                onCheckedChange={(checked) => form.setCreateElection(checked as boolean)}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="position-createElection"
                  className="cursor-pointer font-medium"
                >
                  Create Election for this Position
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create an election and add it to the agenda
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Position</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
