import type { NavigationItem } from '../types/navigation.types.tsx';

function checkExactPathMatch(item: NavigationItem, currentRoute: string): boolean {
  return item.href === currentRoute;
}

function checkHierarchicalPathMatch(
  item: NavigationItem,
  currentRoute: string,
  isPrimary?: boolean
): boolean {
  if (!isPrimary || !item.href) return false;
  return currentRoute.startsWith(item.href + '/');
}

function checkOnClickRouteMatch(
  item: NavigationItem,
  currentRoute: string,
  isPrimary?: boolean
): boolean {
  if (!item.onClick) return false;

  try {
    const onClickStr = item.onClick.toString();
    // Look for navigation patterns like "navigate({ to: '/route' })" or "router.navigate({ to: '/route' })"
    const routeMatch = onClickStr.match(/to:\s*['"]([^'"]+)['"]\s*}/);

    if (routeMatch) {
      const route = routeMatch[1];
      // Exact match
      if (route === currentRoute) {
        return true;
      }
      // Child route match - only apply when isPrimary is true
      if (isPrimary && currentRoute.startsWith(route + '/')) {
        return true;
      }
    }
  } catch (e) {
    console.error('Error parsing onClick route:', e);
  }

  return false;
}

// Check for ID-based route matches
function checkIdBasedMatch(
  item: NavigationItem,
  currentRoute: string,
  isPrimary?: boolean
): boolean {
  // Special case for home route
  if (item.id === 'home' && currentRoute === '/') {
    return true;
  }

  const routePath = currentRoute.startsWith('/') ? currentRoute.slice(1) : currentRoute;

  // Exact match with ID
  if (routePath === item.id) {
    return true;
  }

  // Child route matching with ID - only apply when isPrimary is true
  if (isPrimary && routePath.startsWith(item.id + '/')) {
    return true;
  }

  return false;
}

export function isItemActive(
  item: NavigationItem,
  currentRoute?: string,
  isPrimary?: boolean
): boolean {
  if (!currentRoute) return false;

  return (
    checkExactPathMatch(item, currentRoute) ||
    checkHierarchicalPathMatch(item, currentRoute, isPrimary) ||
    checkOnClickRouteMatch(item, currentRoute, isPrimary) ||
    checkIdBasedMatch(item, currentRoute, isPrimary)
  );
}
