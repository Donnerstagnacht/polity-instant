import {
  AreaChart,
  Bell,
  Bookmark,
  Calendar,
  CheckSquare,
  File,
  FileText,
  FolderOpen,
  Heart,
  Home,
  Keyboard,
  Laptop,
  LayoutDashboard,
  LineChart,
  Mail,
  MessageSquare,
  Moon,
  PlusCircle,
  Search,
  Settings,
  Sun,
  User,
  Users,
  Workflow,
} from 'lucide-react';
import type { ComponentType } from 'react';

export const iconMap = {
  Home,
  Settings,
  User,
  Users,
  Mail,
  Search,
  Bell,
  Heart,
  Bookmark,
  LayoutDashboard,
  File,
  FolderOpen,
  Calendar,
  CheckSquare,
  MessageSquare,
  Moon,
  Sun,
  Laptop,
  Keyboard,
  LineChart,
  FileText,
  AreaChart,
  Workflow,
  PlusCircle,
} as const;

export type IconName = keyof typeof iconMap;

/**
 * Helper function to get the correct icon component by name
 * @param iconName The name of the icon to retrieve (must be a key in iconMap)
 * @returns The corresponding icon component or a search icon as fallback
 */
export function getIconComponent(iconName: IconName): ComponentType<{ className?: string }> {
  return iconMap[iconName] || Search;
}
