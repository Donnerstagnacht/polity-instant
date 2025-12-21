'use client';

import { useState } from 'react';

export interface AmendmentFilters {
  searchQuery: string;
  statusFilter: string;
  hashtagFilter: string;
}

/**
 * Hook to manage amendment filters and search
 */
export function useAmendmentFilters() {
  const [filters, setFilters] = useState<AmendmentFilters>({
    searchQuery: '',
    statusFilter: 'all',
    hashtagFilter: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof AmendmentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilter = (key: keyof AmendmentFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === 'statusFilter' ? 'all' : '',
    }));
  };

  const hasActiveFilters = filters.statusFilter !== 'all' || filters.hashtagFilter !== '';

  return {
    filters,
    showFilters,
    hasActiveFilters,
    updateFilter,
    clearFilter,
    setShowFilters,
  };
}

/**
 * Filter amendment by hashtag
 */
function matchesHashtag(amendment: any, hashtagFilter: string) {
  if (!hashtagFilter) return true;
  if (!amendment.hashtags || amendment.hashtags.length === 0) return false;

  const cleanFilter = hashtagFilter.startsWith('#')
    ? hashtagFilter.substring(1).toLowerCase()
    : hashtagFilter.toLowerCase();

  return amendment.hashtags.some((h: any) => {
    if (!h || !h.tag) return false;
    return h.tag.toLowerCase() === cleanFilter || h.tag.toLowerCase().includes(cleanFilter);
  });
}

/**
 * Filter amendment by search query
 */
function matchesSearchQuery(amendment: any, searchQuery: string) {
  if (!searchQuery) return true;
  const query = searchQuery.toLowerCase();

  // Check if query matches title, subtitle, or code
  if (
    (amendment.title && amendment.title.toLowerCase().includes(query)) ||
    (amendment.subtitle && amendment.subtitle.toLowerCase().includes(query)) ||
    (amendment.code && amendment.code.toLowerCase().includes(query))
  ) {
    return true;
  }

  // Check if query matches any hashtag
  if (amendment.hashtags && amendment.hashtags.length > 0) {
    return amendment.hashtags.some((h: any) => {
      if (!h || !h.tag) return false;
      return h.tag.toLowerCase().includes(query);
    });
  }

  return false;
}

/**
 * Filter and sort amendments based on filters
 */
export function useFilteredAmendments(amendments: any[], filters: AmendmentFilters) {
  // Apply all filters
  const filteredAmendments = amendments.filter((amendment: any) => {
    if (!matchesSearchQuery(amendment, filters.searchQuery)) return false;
    if (filters.statusFilter !== 'all' && amendment.status !== filters.statusFilter) return false;
    if (!matchesHashtag(amendment, filters.hashtagFilter)) return false;
    return true;
  });

  // Sort by date (most recent first)
  const sortedAmendments = [...filteredAmendments].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Group amendments by status
  const groupedAmendments = {
    passed: sortedAmendments.filter((a: any) => {
      const status = a.status?.toLowerCase();
      return status === 'approved' || status === 'passed' || status === 'active';
    }),
    underReview: sortedAmendments.filter((a: any) => {
      const status = a.status?.toLowerCase();
      return status === 'pending' || status === 'under review' || status === 'review';
    }),
    drafting: sortedAmendments.filter((a: any) => {
      const status = a.status?.toLowerCase();
      return status === 'draft' || status === 'drafting';
    }),
    rejected: sortedAmendments.filter((a: any) => {
      const status = a.status?.toLowerCase();
      return status === 'rejected' || status === 'denied';
    }),
  };

  return {
    sortedAmendments,
    groupedAmendments,
  };
}
