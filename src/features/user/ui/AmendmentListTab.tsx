import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { AmendmentSearchCard } from '@/features/search/ui/AmendmentSearchCard';
import { GRADIENTS } from '../state/gradientColors';
import type { UserAmendment } from '../types/user.types';

interface AmendmentListTabProps {
  amendments: UserAmendment[];
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const AmendmentListTab: React.FC<AmendmentListTabProps> = ({
  amendments,
  searchValue,
  onSearchChange,
}) => {
  const filteredAmendments = useMemo(() => {
    const term = (searchValue ?? '').toLowerCase();
    if (!term) return amendments;
    return amendments.filter(
      amendment =>
        amendment.title.toLowerCase().includes(term) ||
        amendment.status.toLowerCase().includes(term) ||
        (amendment.subtitle && amendment.subtitle.toLowerCase().includes(term)) ||
        (amendment.code && amendment.code.toLowerCase().includes(term)) ||
        amendment.date.toLowerCase().includes(term) ||
        (amendment.tags && amendment.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  }, [amendments, searchValue]);

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search amendments by title, code, tags..."
          className="pl-10"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      {filteredAmendments.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No amendments found matching your search.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAmendments.map((amendment, index) => (
            <AmendmentSearchCard
              key={amendment.id}
              amendment={amendment}
              gradientClass={GRADIENTS[index % GRADIENTS.length]}
            />
          ))}
        </div>
      )}
    </>
  );
};
