/**
 * Create Document Dialog Component
 *
 * Dialog for creating a new document in a group.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';

interface CreateDocumentDialogProps {
  groupId: string;
  groupName?: string;
  onCreateDocument: (title: string) => Promise<void>;
  isCreating?: boolean;
}

export function CreateDocumentDialog({
  groupId,
  groupName,
  onCreateDocument,
  isCreating = false,
}: CreateDocumentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    await onCreateDocument(title);
    setTitle('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleCreate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>
            Enter a title for your new document{groupName ? ` in ${groupName}` : ''}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              placeholder="My Document"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCreating}
              autoFocus
            />
          </div>
          <Button onClick={handleCreate} className="w-full" disabled={isCreating || !title.trim()}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Document'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
