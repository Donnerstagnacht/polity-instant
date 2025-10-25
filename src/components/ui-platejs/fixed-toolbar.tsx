import { cn } from '@/utils/utils.ts';
import { useNavigationStore } from '@/navigation/state/navigation.store';
import { useScreenStore } from '@/global-state/screen.store';

import { Toolbar } from '../ui/toolbar.tsx';

export function FixedToolbar(props: React.ComponentProps<typeof Toolbar>) {
  const { navigationView } = useNavigationStore();
  const { isMobileScreen } = useScreenStore();

  // Calculate left offset based on sidebar width (only on desktop)
  const getLeftOffset = () => {
    if (isMobileScreen) return 'left-0';

    if (navigationView === 'asButtonList') return 'left-16'; // 64px
    if (navigationView === 'asLabeledButtonList') return 'left-64'; // 256px

    return 'left-0';
  };

  // Calculate width based on sidebar (only on desktop)
  const getWidth = () => {
    if (isMobileScreen) return 'w-full';

    if (navigationView === 'asButtonList') return 'w-[calc(100%-4rem)]'; // 100% - 64px
    if (navigationView === 'asLabeledButtonList') return 'w-[calc(100%-16rem)]'; // 100% - 256px

    return 'w-full';
  };

  return (
    <Toolbar
      {...props}
      className={cn(
        'scrollbar-hide supports-backdrop-blur:bg-background/60 fixed top-0 z-50 justify-between overflow-x-auto border-b border-b-border bg-background/95 p-1 backdrop-blur-sm transition-all duration-300',
        getLeftOffset(),
        getWidth(),
        props.className
      )}
    />
  );
}
