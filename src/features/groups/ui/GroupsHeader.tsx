import React from 'react';
import { Users } from 'lucide-react';

export const GroupsHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Groups</h1>
          <p className="text-muted-foreground">
            Discover and join communities working on important causes
          </p>
        </div>
      </div>
    </div>
  );
};
