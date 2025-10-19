import { cn } from '@/utils/utils.ts';

import { Toolbar } from '../ui/toolbar.tsx';

export function FixedToolbar(props: React.ComponentProps<typeof Toolbar>) {
  return (
    <Toolbar
      {...props}
      className={cn(
        'scrollbar-hide supports-backdrop-blur:bg-background/60 sticky left-0 top-0 z-50 w-full justify-between overflow-x-auto rounded-t-lg border-b border-b-border bg-background/95 p-1 backdrop-blur-sm',
        props.className
      )}
    />
  );
}
