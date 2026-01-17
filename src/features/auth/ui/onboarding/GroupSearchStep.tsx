'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Users, MapPin, ArrowRight, ArrowLeft, Check, SkipForward } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { db } from '../../../../../db/db';
import type { Group } from './useOnboarding';
import { cn } from '@/utils/utils';

interface GroupSearchStepProps {
  selectedGroup: Group | null;
  onSelectGroup: (group: Group | null) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function GroupSearchStep({
  selectedGroup,
  onSelectGroup,
  onNext,
  onBack,
  isLoading,
}: GroupSearchStepProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Query all public groups
  const { data: groupsData, isLoading: groupsLoading } = db.useQuery({
    groups: {
      $: {
        where: {
          isPublic: true,
        },
        limit: 100,
      },
    },
  });

  // Filter groups based on search term
  const filteredGroups = useMemo(() => {
    const groups = groupsData?.groups || [];
    if (!searchTerm.trim()) {
      return groups.slice(0, 10); // Show first 10 if no search
    }

    const term = searchTerm.toLowerCase();
    return groups.filter(
      (group: any) =>
        group.name?.toLowerCase().includes(term) ||
        group.description?.toLowerCase().includes(term) ||
        group.location?.toLowerCase().includes(term)
    );
  }, [groupsData?.groups, searchTerm]);

  const handleSelectGroup = (group: any) => {
    if (selectedGroup?.id === group.id) {
      onSelectGroup(null); // Deselect
    } else {
      onSelectGroup({
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: group.memberCount || 0,
        location: group.location,
        isPublic: group.isPublic,
      });
    }
  };

  const handleSkip = () => {
    onSelectGroup(null);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-4">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">{t('onboarding.groupStep.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('onboarding.groupStep.description')}</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('onboarding.groupStep.searchPlaceholder')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={isLoading}
        />
      </div>

      {/* Group Cards */}
      <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
        {groupsLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {t('onboarding.groupStep.noResults')}
          </div>
        ) : (
          filteredGroups.map((group: any) => (
            <Card
              key={group.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                selectedGroup?.id === group.id &&
                  'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900'
              )}
              onClick={() => handleSelectGroup(group)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {selectedGroup?.id === group.id && (
                      <div className="rounded-full bg-primary p-1">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <Badge variant="outline" className="flex-shrink-0">
                      <Users className="mr-1 h-3 w-3" />
                      {group.memberCount || 0}
                    </Badge>
                  </div>
                </div>
                {group.description && (
                  <CardDescription className="line-clamp-2 text-xs">
                    {group.description}
                  </CardDescription>
                )}
              </CardHeader>
              {group.location && (
                <CardContent className="pt-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{group.location}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.goBack')}
        </Button>

        {selectedGroup ? (
          <Button onClick={onNext} disabled={isLoading} className="flex-1">
            {t('onboarding.groupStep.continue')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button variant="secondary" onClick={handleSkip} disabled={isLoading} className="flex-1">
            <SkipForward className="mr-2 h-4 w-4" />
            {t('onboarding.groupStep.skip')}
          </Button>
        )}
      </div>
    </div>
  );
}
