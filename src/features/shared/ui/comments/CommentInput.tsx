'use client';

import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import { Textarea } from '@/features/shared/ui/ui/textarea';
import { Send } from 'lucide-react';
import { cn } from '@/features/shared/utils/utils';

interface CommentInputProps {
  onSubmit: (text: string) => Promise<void>;
  placeholder?: string;
  replyTo?: string;
  onCancelReply?: () => void;
  className?: string;
}

export function CommentInput({
  onSubmit,
  placeholder = 'Write a comment...',
  replyTo,
  onCancelReply,
  className,
}: CommentInputProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {replyTo && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Replying to {replyTo}</span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-xs underline hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="flex-1 resize-none"
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {text.length} characters · Ctrl+Enter to submit
      </p>
    </div>
  );
}
