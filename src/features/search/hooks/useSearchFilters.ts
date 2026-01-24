import { useMemo } from 'react';
import { SearchFilters } from '../types/search.types';
import { filterByQuery, matchesHashtag, sortResults } from '../utils/searchUtils';

export function useSearchFilters(data: any, filters: SearchFilters) {
  const { query, sortBy, topics } = filters;

  const matchesTopics = (item: any) => {
    if (!topics || topics.length === 0) return true;
    return topics.some(topic => matchesHashtag(item, topic));
  };

  const filteredUsers = useMemo(
    () =>
      data?.$users?.filter((user: any) => {
        if (!filterByQuery(user.name || '', query)) return false;
        if (!matchesTopics({ hashtags: user.hashtags })) return false;
        return true;
      }) || [],
    [data?.$users, query, topics]
  );

  const filteredGroups = useMemo(
    () =>
      data?.groups?.filter((group: any) => {
        if (!filterByQuery(group.name || '', query)) return false;
        if (!matchesTopics(group)) return false;
        return true;
      }) || [],
    [data?.groups, query, topics]
  );

  const filteredStatements = useMemo(
    () =>
      data?.statements?.filter((statement: any) => {
        // Search in text, tag (type), and user name
        const matchesText = filterByQuery(statement.text || '', query);
        const matchesTag = statement.tag && filterByQuery(statement.tag, query);
        const matchesType = statement.type && filterByQuery(statement.type, query);
        const matchesUser = statement.user?.name && filterByQuery(statement.user.name, query);

        if (!matchesTopics(statement)) return false;
        if (!query) return true;
        return matchesText || matchesTag || matchesType || matchesUser;
      }) || [],
    [data?.statements, query, topics]
  );

  const filteredBlogs = useMemo(
    () =>
      data?.blogs?.filter((blog: any) => {
        if (!matchesTopics(blog)) return false;

        // Search in title and content
        const matchesTitle = filterByQuery(blog.title || '', query);
        const matchesContent = blog.content && filterByQuery(blog.content, query);
        const authorNames = (blog.blogRoleBloggers || [])
          .map((relation: any) => relation?.user?.name)
          .filter(Boolean);
        const matchesUser = authorNames.some((name: string) => filterByQuery(name, query));

        if (!query) return true;
        return matchesTitle || matchesContent || matchesUser;
      }) || [],
    [data?.blogs, query, topics]
  );

  const filteredAmendments = useMemo(
    () =>
      data?.amendments?.filter((amendment: any) => {
        if (!matchesTopics(amendment)) return false;

        // Search in title, subtitle, and content
        const matchesTitle = filterByQuery(amendment.title || '', query);
        const matchesSubtitle = amendment.subtitle && filterByQuery(amendment.subtitle, query);
        const matchesContent = amendment.content && filterByQuery(amendment.content, query);
        const matchesUser = amendment.user?.name && filterByQuery(amendment.user.name, query);

        if (!query) return true;
        return matchesTitle || matchesSubtitle || matchesContent || matchesUser;
      }) || [],
    [data?.amendments, query, topics]
  );

  const filteredEvents = useMemo(
    () =>
      data?.events?.filter((event: any) => {
        if (!matchesTopics(event)) return false;

        // Search in title, description, location, and organizer name
        const matchesTitle = filterByQuery(event.title || '', query);
        const matchesDescription = event.description && filterByQuery(event.description, query);
        const matchesLocation = event.location && filterByQuery(event.location, query);
        const matchesOrganizer =
          event.organizer?.name && filterByQuery(event.organizer.name, query);
        const matchesGroup = event.group?.name && filterByQuery(event.group.name, query);

        if (!query) return true;
        return (
          matchesTitle || matchesDescription || matchesLocation || matchesOrganizer || matchesGroup
        );
      }) || [],
    [data?.events, query, topics]
  );

  const filteredTodos = useMemo(
    () =>
      data?.todos?.filter((todo: any) => {
        const todoTags = (todo.tags || []) as string[];
        if (topics.length > 0 && !topics.some(topic => todoTags.includes(topic))) {
          return false;
        }

        const matchesTitle = filterByQuery(todo.title || '', query);
        const matchesDescription = todo.description && filterByQuery(todo.description, query);
        const matchesGroup = todo.group?.name && filterByQuery(todo.group.name, query);
        const matchesCreator = todo.creator?.name && filterByQuery(todo.creator.name, query);

        if (!query) return true;
        return matchesTitle || matchesDescription || matchesGroup || matchesCreator;
      }) || [],
    [data?.todos, query, topics]
  );

  const allResults = useMemo(
    () => ({
      users: sortResults(filteredUsers, sortBy),
      groups: sortResults(filteredGroups, sortBy),
      statements: sortResults(filteredStatements, sortBy),
      todos: sortResults(filteredTodos, sortBy),
      blogs: sortResults(filteredBlogs, sortBy),
      amendments: sortResults(filteredAmendments, sortBy),
      events: sortResults(filteredEvents, sortBy),
    }),
    [
      filteredUsers,
      filteredGroups,
      filteredStatements,
      filteredTodos,
      filteredBlogs,
      filteredAmendments,
      filteredEvents,
      sortBy,
    ]
  );

  const totalResults =
    allResults.users.length +
    allResults.groups.length +
    allResults.statements.length +
    allResults.todos.length +
    allResults.blogs.length +
    allResults.amendments.length +
    allResults.events.length;

  const mosaicResults = useMemo(
    () => [
      ...allResults.users.map((item: any) => ({ ...item, _type: 'user' as const })),
      ...allResults.groups.map((item: any) => ({ ...item, _type: 'group' as const })),
      ...allResults.statements.map((item: any) => ({ ...item, _type: 'statement' as const })),
      ...allResults.todos.map((item: any) => ({ ...item, _type: 'todo' as const })),
      ...allResults.blogs.map((item: any) => ({ ...item, _type: 'blog' as const })),
      ...allResults.amendments.map((item: any) => ({ ...item, _type: 'amendment' as const })),
      ...allResults.events.map((item: any) => ({ ...item, _type: 'event' as const })),
    ],
    [allResults]
  );

  return { allResults, totalResults, mosaicResults };
}
