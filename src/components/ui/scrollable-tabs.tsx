import * as React from 'react';
import { TabsList } from '@/components/ui/tabs';
import { cn } from '@/utils/utils';

/**
 * ScrollableTabsList
 *
 * A wrapper around TabsList that makes it horizontally scrollable on mobile/small screens
 * without showing scrollbars. Use this instead of grid-based layouts for better mobile UX.
 *
 * @example
 * ```tsx
 * <Tabs value={activeTab} onValueChange={setActiveTab}>
 *   <ScrollableTabsList>
 *     <TabsTrigger value="all">All</TabsTrigger>
 *     <TabsTrigger value="users">Users</TabsTrigger>
 *     <TabsTrigger value="groups">Groups</TabsTrigger>
 *   </ScrollableTabsList>
 *   <TabsContent value="all">...</TabsContent>
 * </Tabs>
 * ```
 */
export const ScrollableTabsList = React.forwardRef<
  React.ElementRef<typeof TabsList>,
  React.ComponentPropsWithoutRef<typeof TabsList>
>(({ className, children, ...props }, ref) => {
  return (
    <TabsList
      ref={ref}
      className={cn('scrollbar-hide inline-flex w-full justify-start overflow-x-auto', className)}
      {...props}
    >
      {React.Children.map(children, child => {
        // Add whitespace-nowrap to each TabsTrigger child to prevent wrapping
        if (React.isValidElement(child)) {
          const existingClassName = (child.props as any).className;
          return React.cloneElement(child as React.ReactElement<any>, {
            className: cn('whitespace-nowrap', existingClassName),
          });
        }
        return child;
      })}
    </TabsList>
  );
});

ScrollableTabsList.displayName = 'ScrollableTabsList';
