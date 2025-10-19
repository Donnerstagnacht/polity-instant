import * as React from 'react';
import { cn } from '@/utils/utils.ts';

type VisuallyHiddenProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * This component visually hides content while keeping it accessible to screen readers.
 * It's useful for providing context to assistive technologies without changing the visual design.
 */
const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0',
          'clip-path-[inset(50%)]',
          className
        )}
        style={{
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          height: '1px',
          width: '1px',
          margin: '-1px',
          overflow: 'hidden',
          padding: 0,
          position: 'absolute',
          whiteSpace: 'nowrap',
        }}
        {...props}
      />
    );
  }
);
VisuallyHidden.displayName = 'VisuallyHidden';

export { VisuallyHidden };
