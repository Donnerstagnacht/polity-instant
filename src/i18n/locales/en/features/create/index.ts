export const createTranslations = {
  title: 'Create',
  description: 'Create new content',
  dashboard: {
    title: 'Create',
    description: 'What would you like to create?',
  },
  types: {
    group: {
      title: 'Group',
      description: 'Create a new group or organization',
    },
    event: {
      title: 'Event',
      description: 'Schedule a new event or meeting',
    },
    amendment: {
      title: 'Amendment',
      description: 'Propose a new amendment or policy change',
    },
    blog: {
      title: 'Blog',
      description: 'Write a new blog post',
    },
    statement: {
      title: 'Statement',
      description: 'Share your position on an issue',
    },
    todo: {
      title: 'Todo',
      description: 'Add a new task to track',
    },
    document: {
      title: 'Document',
      description: 'Create a collaborative document',
    },
    position: {
      title: 'Position',
      description: 'Create a new position in an organization',
    },
    agendaItem: {
      title: 'Agenda Item',
      description: 'Add an item to an event agenda',
    },
    electionCandidate: {
      title: 'Election Candidate',
      description: 'Register as a candidate for an election',
    },
  },
  form: {
    title: 'Title',
    titlePlaceholder: 'Enter a title',
    description: 'Description',
    descriptionPlaceholder: 'Enter a description',
    submit: 'Create',
    cancel: 'Cancel',
    creating: 'Creating...',
  },
  success: {
    title: 'Created successfully',
    description: 'Your {{type}} has been created.',
    viewButton: 'View',
    createAnother: 'Create another',
  },
  errors: {
    failed: 'Failed to create {{type}}',
    titleRequired: 'Title is required',
    invalidData: 'Please check your input',
  },
} as const;
