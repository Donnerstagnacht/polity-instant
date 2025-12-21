import { useMemo } from 'react';
import { SearchFilters } from '../types/search.types';
import { filterByQuery, matchesHashtag, sortResults } from '../utils/searchUtils';

export function useSearchFilters(data: any, filters: SearchFilters) {
  const { query, sortBy, publicOnly, hashtag } = filters;

  const filteredUsers = useMemo(() => 
    data?.$users?.filter((user: any) => {
      if (!filterByQuery(user.name || '', query)) return false;
      // Check hashtags
      if (hashtag && user?.hashtags) {
        if (!matchesHashtag({ hashtags: user.hashtags }, hashtag)) return false;
      }
      return true;
    }) || [], [data?.$users, query, hashtag]);

  const filteredGroups = useMemo(() =>
    data?.groups?.filter((group: any) => {
      if (!filterByQuery(group.name || '', query)) return false;
      if (publicOnly && !group.isPublic) return false;
      if (!matchesHashtag(group, hashtag)) return false;
      return true;
    }) || [], [data?.groups, query, publicOnly, hashtag]);

  const filteredStatements = useMemo(() =>
    data?.statements?.filter((statement: any) => {
      // Search in text, tag (type), and user name
      const matchesText = filterByQuery(statement.text || '', query);
      const matchesTag = statement.tag && filterByQuery(statement.tag, query);
      const matchesType = statement.type && filterByQuery(statement.type, query);
      const matchesUser = statement.user?.name && filterByQuery(statement.user.name, query);

      if (!query) return true;
      return matchesText || matchesTag || matchesType || matchesUser;
    }) || [], [data?.statements, query]);

  const filteredBlogs = useMemo(() =>
    data?.blogs?.filter((blog: any) => {
      // Check hashtag filter first
      if (!matchesHashtag(blog, hashtag)) return false;

      // Search in title and content
      const matchesTitle = filterByQuery(blog.title || '', query);
      const matchesContent = blog.content && filterByQuery(blog.content, query);
      const matchesUser = blog.user?.name && filterByQuery(blog.user.name, query);

      if (!query) return true;
      return matchesTitle || matchesContent || matchesUser;
    }) || [], [data?.blogs, query, hashtag]);

  const filteredAmendments = useMemo(() =>
    data?.amendments?.filter((amendment: any) => {
      // Check hashtag filter first
      if (!matchesHashtag(amendment, hashtag)) return false;

      // Search in title, subtitle, and content
      const matchesTitle = filterByQuery(amendment.title || '', query);
      const matchesSubtitle = amendment.subtitle && filterByQuery(amendment.subtitle, query);
      const matchesContent = amendment.content && filterByQuery(amendment.content, query);
      const matchesUser = amendment.user?.name && filterByQuery(amendment.user.name, query);

      if (!query) return true;
      return matchesTitle || matchesSubtitle || matchesContent || matchesUser;
    }) || [], [data?.amendments, query, hashtag]);

  const filteredEvents = useMemo(() =>
    data?.events?.filter((event: any) => {
      // Check public filter first
      if (publicOnly && !event.isPublic) return false;

      // Check hashtag filter
      if (!matchesHashtag(event, hashtag)) return false;

      // Search in title, description, location, and organizer name
      const matchesTitle = filterByQuery(event.title || '', query);
      const matchesDescription = event.description && filterByQuery(event.description, query);
      const matchesLocation = event.location && filterByQuery(event.location, query);
      const matchesOrganizer = event.organizer?.name && filterByQuery(event.organizer.name, query);
      const matchesGroup = event.group?.name && filterByQuery(event.group.name, query);

      if (!query) return true;
      return (
        matchesTitle || matchesDescription || matchesLocation || matchesOrganizer || matchesGroup
      );
    }) || [], [data?.events, query, publicOnly, hashtag]);

  const allResults = useMemo(() => ({
    users: sortResults(filteredUsers, sortBy),
    groups: sortResults(filteredGroups, sortBy),
    statements: sortResults(filteredStatements, sortBy),
    blogs: sortResults(filteredBlogs, sortBy),
    amendments: sortResults(filteredAmendments, sortBy),
    events: sortResults(filteredEvents, sortBy),
  }), [filteredUsers, filteredGroups, filteredStatements, filteredBlogs, filteredAmendments, filteredEvents, sortBy]);

  const totalResults =
    allResults.users.length +
    allResults.groups.length +
    allResults.statements.length +
    allResults.blogs.length +
    allResults.amendments.length +
    allResults.events.length;

  const mosaicResults = useMemo(() => [
    ...allResults.users.map((item: any) => ({ ...item, _type: 'user' as const })),
    ...allResults.groups.map((item: any) => ({ ...item, _type: 'group' as const })),
    ...allResults.statements.map((item: any) => ({ ...item, _type: 'statement' as const })),
    ...allResults.blogs.map((item: any) => ({ ...item, _type: 'blog' as const })),
    ...allResults.amendments.map((item: any) => ({ ...item, _type: 'amendment' as const })),
    ...allResults.events.map((item: any) => ({ ...item, _type: 'event' as const })),
  ], [allResults]);

  return { allResults, totalResults, mosaicResults };
}
