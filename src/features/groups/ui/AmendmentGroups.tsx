'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AmendmentCard } from './AmendmentCard';

interface AmendmentGroupsProps {
  groupedAmendments: {
    passed: any[];
    underReview: any[];
    drafting: any[];
    rejected: any[];
  };
}

export function AmendmentGroups({ groupedAmendments }: AmendmentGroupsProps) {
  const [openSections, setOpenSections] = useState({
    passed: true,
    underReview: true,
    drafting: true,
    rejected: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
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
                <h2 className="text-xl font-semibold">Passed</h2>
                <Badge variant="secondary">{groupedAmendments.passed.length}</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {groupedAmendments.passed.map((amendment: any) => (
                  <AmendmentCard key={amendment.id} amendment={amendment} />
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
                <h2 className="text-xl font-semibold">Under Review</h2>
                <Badge variant="secondary">{groupedAmendments.underReview.length}</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {groupedAmendments.underReview.map((amendment: any) => (
                  <AmendmentCard key={amendment.id} amendment={amendment} />
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
                <h2 className="text-xl font-semibold">Drafting</h2>
                <Badge variant="secondary">{groupedAmendments.drafting.length}</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {groupedAmendments.drafting.map((amendment: any) => (
                  <AmendmentCard key={amendment.id} amendment={amendment} />
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
                <h2 className="text-xl font-semibold">Rejected</h2>
                <Badge variant="secondary">{groupedAmendments.rejected.length}</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                {groupedAmendments.rejected.map((amendment: any) => (
                  <AmendmentCard key={amendment.id} amendment={amendment} />
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </div>
  );
}
