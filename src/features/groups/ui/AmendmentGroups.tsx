'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { AmendmentTimelineCard } from '@/features/timeline/ui/cards/AmendmentTimelineCard';

interface AmendmentGroupsProps {
  groupedAmendments: {
    passed: any[];
    underReview: any[];
    drafting: any[];
    rejected: any[];
  };
  groupName?: string;
  groupId?: string;
}

export function AmendmentGroups({ groupedAmendments, groupName, groupId }: AmendmentGroupsProps) {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState({
    passed: true,
    underReview: true,
    drafting: true,
    rejected: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const normalizeStatus = (
    status?: string
  ):
    | 'collaborative_editing'
    | 'internal_suggesting'
    | 'internal_voting'
    | 'viewing'
    | 'event_suggesting'
    | 'event_voting'
    | 'passed'
    | 'rejected' => {
    if (!status) return 'viewing';
    const normalized = status.toLowerCase();
    if (
      normalized === 'collaborative_editing' ||
      normalized === 'internal_suggesting' ||
      normalized === 'internal_voting' ||
      normalized === 'viewing' ||
      normalized === 'event_suggesting' ||
      normalized === 'event_voting' ||
      normalized === 'passed' ||
      normalized === 'rejected'
    ) {
      return normalized as
        | 'collaborative_editing'
        | 'internal_suggesting'
        | 'internal_voting'
        | 'viewing'
        | 'event_suggesting'
        | 'event_voting'
        | 'passed'
        | 'rejected';
    }
    if (normalized === 'drafting' || normalized === 'draft') {
      return 'collaborative_editing';
    }
    if (normalized === 'under review' || normalized === 'review') {
      return 'internal_voting';
    }
    return 'viewing';
  };

  return (
    <div className="space-y-6">
      {/* Passed Section */}
      {groupedAmendments.passed.length > 0 && (
        <Collapsible open={openSections.passed} onOpenChange={() => toggleSection('passed')}>
          <div className="rounded-lg border bg-card">
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent">
              <div className="flex items-center gap-2">
                {openSections.passed ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                <h2 className="text-xl font-semibold">
                  {t('pages.group.amendments.statusBreakdown.passed')}
                </h2>
                <Badge variant="secondary">{groupedAmendments.passed.length}</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {groupedAmendments.passed.map((amendment: any) => (
                  <AmendmentTimelineCard
                    key={amendment.id}
                    amendment={{
                      id: String(amendment.id),
                      title: amendment.title,
                      subtitle: groupName,
                      description: amendment.subtitle,
                      status: normalizeStatus(amendment.status),
                      groupName,
                      groupId,
                      hashtags: amendment.hashtags,
                    }}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Under Review Section */}
      {groupedAmendments.underReview.length > 0 && (
        <Collapsible
          open={openSections.underReview}
          onOpenChange={() => toggleSection('underReview')}
        >
          <div className="rounded-lg border bg-card">
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent">
              <div className="flex items-center gap-2">
                {openSections.underReview ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                <h2 className="text-xl font-semibold">
                  {t('pages.group.amendments.statusBreakdown.underReview')}
                </h2>
                <Badge variant="secondary">{groupedAmendments.underReview.length}</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {groupedAmendments.underReview.map((amendment: any) => (
                  <AmendmentTimelineCard
                    key={amendment.id}
                    amendment={{
                      id: String(amendment.id),
                      title: amendment.title,
                      subtitle: groupName,
                      description: amendment.subtitle,
                      status: normalizeStatus(amendment.status),
                      groupName,
                      groupId,
                      hashtags: amendment.hashtags,
                    }}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Drafting Section */}
      {groupedAmendments.drafting.length > 0 && (
        <Collapsible open={openSections.drafting} onOpenChange={() => toggleSection('drafting')}>
          <div className="rounded-lg border bg-card">
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent">
              <div className="flex items-center gap-2">
                {openSections.drafting ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                <h2 className="text-xl font-semibold">
                  {t('pages.group.amendments.statusBreakdown.drafting')}
                </h2>
                <Badge variant="secondary">{groupedAmendments.drafting.length}</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {groupedAmendments.drafting.map((amendment: any) => (
                  <AmendmentTimelineCard
                    key={amendment.id}
                    amendment={{
                      id: String(amendment.id),
                      title: amendment.title,
                      subtitle: groupName,
                      description: amendment.subtitle,
                      status: normalizeStatus(amendment.status),
                      groupName,
                      groupId,
                      hashtags: amendment.hashtags,
                    }}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Rejected Section */}
      {groupedAmendments.rejected.length > 0 && (
        <Collapsible open={openSections.rejected} onOpenChange={() => toggleSection('rejected')}>
          <div className="rounded-lg border bg-card">
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent">
              <div className="flex items-center gap-2">
                {openSections.rejected ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                <h2 className="text-xl font-semibold">
                  {t('pages.group.amendments.statusBreakdown.rejected')}
                </h2>
                <Badge variant="secondary">{groupedAmendments.rejected.length}</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {groupedAmendments.rejected.map((amendment: any) => (
                  <AmendmentTimelineCard
                    key={amendment.id}
                    amendment={{
                      id: String(amendment.id),
                      title: amendment.title,
                      subtitle: groupName,
                      description: amendment.subtitle,
                      status: normalizeStatus(amendment.status),
                      groupName,
                      groupId,
                      hashtags: amendment.hashtags,
                    }}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </div>
  );
}
