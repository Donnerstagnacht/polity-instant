/**
 * Links Section Component
 * 
 * Displays group links with add functionality.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import type { GroupLink } from '../types/group.types';

interface LinksSectionProps {
  links: GroupLink[];
  addLinkButton: React.ReactNode;
}

export function LinksSection({ links, addLinkButton }: LinksSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Links</CardTitle>
          {addLinkButton}
        </div>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <p className="text-muted-foreground">No links available</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{link.label}</span>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
