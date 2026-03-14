import { useMemo } from 'react';
import { useSearchData } from './useSearchData';
import { SearchFilters } from '../types/search.types';
import { filterByQuery, matchesHashtag, matchesUserQuery, sortResults } from '../utils/searchUtils';

type SearchData = ReturnType<typeof useSearchData>['data'];

export function useSearchFilters(data: SearchData | undefined, filters: SearchFilters) {
  const { query, sortBy, topics } = filters;

  const matchesTopics = (item: Parameters<typeof matchesHashtag>[0]) => {
    if (!topics || topics.length === 0) return true;
    return topics.some(topic => matchesHashtag(item, topic));
  };

  const filteredUsers = useMemo(
    () =>
      data?.$users?.filter(user => {
        if (!matchesUserQuery(user, query)) return false;
        if (!matchesTopics(user)) return false;
        return true;
      }) || [],
    [data?.$users, query, topics]
  );

  const filteredGroups = useMemo(
    () =>
      data?.groups?.filter(group => {
        if (!filterByQuery(group.name || '', query)) return false;
        if (!matchesTopics(group)) return false;
        return true;
      }) || [],
    [data?.groups, query, topics]
  );

  const filteredStatements = useMemo(
    () =>
      data?.statements?.filter(statement => {
        // Search in text, hashtags, and user name
        const matchesText = filterByQuery(statement.text || '', query);
        const matchesHashtag = statement.statement_hashtags?.some(
          jn => jn.hashtag?.tag && filterByQuery(jn.hashtag.tag, query)
        );
        const matchesUser =
          filterByQuery(statement.user?.first_name, query) ||
          filterByQuery(statement.user?.last_name, query);

        if (!matchesTopics(statement)) return false;
        if (!query) return true;
        return matchesText || matchesHashtag || matchesUser;
      }) || [],
    [data?.statements, query, topics]
  );

  const filteredBlogs = useMemo(
    () =>
      data?.blogs?.filter(blog => {
        if (!matchesTopics(blog)) return false;

        // Search in title and content
        const matchesTitle = filterByQuery(blog.title || '', query);
        const matchesContent = blog.description && filterByQuery(blog.description, query);
        const matchesUser = (blog.bloggers ?? []).some(
          blogger =>
            filterByQuery(blogger.user?.first_name, query) ||
            filterByQuery(blogger.user?.last_name, query)
        );

        if (!query) return true;
        return matchesTitle || matchesContent || matchesUser;
      }) || [],
    [data?.blogs, query, topics]
  );

  const filteredAmendments = useMemo(
    () =>
      data?.amendments?.filter(amendment => {
        if (!matchesTopics(amendment)) return false;

        // Search in title, preamble, and reason
        const matchesTitle = filterByQuery(amendment.title || '', query);
        const matchesPreamble = amendment.preamble && filterByQuery(amendment.preamble, query);
        const matchesReason = amendment.reason && filterByQuery(amendment.reason, query);
        const matchesUser = (amendment.collaborators ?? []).some(
          c =>
            filterByQuery(c.user?.first_name, query) ||
            filterByQuery(c.user?.last_name, query)
        );

        if (!query) return true;
        return matchesTitle || matchesPreamble || matchesReason || matchesUser;
      }) || [],
    [data?.amendments, query, topics]
  );

  const filteredEvents = useMemo(
    () =>
      data?.events?.filter(event => {
        if (!matchesTopics(event)) return false;

        // Search in title, description, location, and creator name
        const matchesTitle = filterByQuery(event.title || '', query);
        const matchesDescription = event.description && filterByQuery(event.description, query);
        const matchesLocation = event.location_name && filterByQuery(event.location_name, query);
        const matchesCreator =
          filterByQuery(event.creator?.first_name, query) ||
          filterByQuery(event.creator?.last_name, query);
        const matchesGroup = event.group?.name && filterByQuery(event.group.name, query);

        if (!query) return true;
        return (
          matchesTitle || matchesDescription || matchesLocation || matchesCreator || matchesGroup
        );
      }) || [],
    [data?.events, query, topics]
  );

  const filteredTodos = useMemo(
    () =>
      data?.todos?.filter(todo => {
        const todoTags = (todo.tags || []) as string[];
        if (topics.length > 0 && !topics.some(topic => todoTags.includes(topic))) {
          return false;
        }

        const matchesTitle = filterByQuery(todo.title || '', query);
        const matchesDescription = todo.description && filterByQuery(todo.description, query);
        const matchesGroup = todo.group?.name && filterByQuery(todo.group.name, query);
        const matchesCreator =
          filterByQuery(todo.creator?.first_name, query) ||
          filterByQuery(todo.creator?.last_name, query);

        if (!query) return true;
        return matchesTitle || matchesDescription || matchesGroup || matchesCreator;
      }) || [],
    [data?.todos, query, topics]
  );

  // Filter elections from direct query
  const filteredElections = useMemo(
    () =>
      data?.elections?.filter(election => {
        const matchesTitle = filterByQuery(election.title || '', query);
        const matchesDescription =
          election.description && filterByQuery(election.description, query);
        const matchesGroup =
          election.position?.group?.name && filterByQuery(election.position.group.name, query);
        const matchesPosition =
          election.position?.title && filterByQuery(election.position.title, query);

        if (!query) return true;
        return matchesTitle || matchesDescription || matchesGroup || matchesPosition;
      }) || [],
    [data?.elections, query]
  );

  // Filter voting sessions (votes)
  const filteredVotes = useMemo(
    () =>
      data?.eventVotingSessions?.filter(session => {
        const matchesType = session.voting_type && filterByQuery(session.voting_type, query);
        const matchesStatus = session.status && filterByQuery(session.status, query);
        const matchesEvent = session.event?.title && filterByQuery(session.event.title, query);

        if (!query) return true;
        return matchesType || matchesStatus || matchesEvent;
      }) || [],
    [data?.eventVotingSessions, query]
  );

  // Filter timeline events for video and image content
  const filteredVideos = useMemo(
    () =>
      data?.timelineEvents?.filter(event => {
        if (event.content_type !== 'video') return false;

        const matchesTitle = filterByQuery(event.title || '', query);
        const matchesDescription = event.description && filterByQuery(event.description, query);
        const matchesGroup = event.group?.name && filterByQuery(event.group.name, query);

        if (!query) return true;
        return matchesTitle || matchesDescription || matchesGroup;
      }) || [],
    [data?.timelineEvents, query]
  );

  const filteredImages = useMemo(
    () =>
      data?.timelineEvents?.filter(event => {
        if (event.content_type !== 'image') return false;

        const matchesTitle = filterByQuery(event.title || '', query);
        const matchesDescription = event.description && filterByQuery(event.description, query);
        const matchesGroup = event.group?.name && filterByQuery(event.group.name, query);

        if (!query) return true;
        return matchesTitle || matchesDescription || matchesGroup;
      }) || [],
    [data?.timelineEvents, query]
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
      elections: sortResults(filteredElections, sortBy),
      votes: sortResults(filteredVotes, sortBy),
      videos: sortResults(filteredVideos, sortBy),
      images: sortResults(filteredImages, sortBy),
    }),
    [
      filteredUsers,
      filteredGroups,
      filteredStatements,
      filteredTodos,
      filteredBlogs,
      filteredAmendments,
      filteredEvents,
      filteredElections,
      filteredVotes,
      filteredVideos,
      filteredImages,
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
    allResults.events.length +
    allResults.elections.length +
    allResults.votes.length +
    allResults.videos.length +
    allResults.images.length;

  const mosaicResults = useMemo(
    () => [
      ...allResults.users.map(item => ({ ...item, _type: 'user' as const })),
      ...allResults.groups.map(item => ({ ...item, _type: 'group' as const })),
      ...allResults.statements.map(item => ({ ...item, _type: 'statement' as const })),
      ...allResults.todos.map(item => ({ ...item, _type: 'todo' as const })),
      ...allResults.blogs.map(item => ({ ...item, _type: 'blog' as const })),
      ...allResults.amendments.map(item => ({ ...item, _type: 'amendment' as const })),
      ...allResults.events.map(item => ({ ...item, _type: 'event' as const })),
      ...allResults.elections.map(item => ({ ...item, _type: 'election' as const })),
      ...allResults.votes.map(item => ({ ...item, _type: 'vote' as const })),
      ...allResults.videos.map(item => ({ ...item, _type: 'video' as const })),
      ...allResults.images.map(item => ({ ...item, _type: 'image' as const })),
    ],
    [allResults]
  );

  return { allResults, totalResults, mosaicResults };
}
