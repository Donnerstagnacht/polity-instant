/**
 * Unified Editor Translations - English
 */

export const editor = {
  // General
  description: 'Edit the content. Changes are saved automatically as you type.',

  // Header
  header: {
    titlePlaceholder: 'Enter title...',
    untitled: 'Untitled',
    saving: 'Saving...',
    saveFailed: 'Save failed',
    unsavedChanges: 'Unsaved changes',
    allSaved: 'All changes saved',
  },

  // Navigation
  navigation: {
    backToAmendment: 'Back to Amendment',
    backToBlog: 'Back to Blog',
    backToDocuments: 'Back to Documents',
    backToGroup: 'Back to Group',
  },

  // Errors
  errors: {
    notFound: 'Content not found. The item may have been deleted.',
    noAccess: "You don't have access to this content.",
  },

  // Metadata
  metadata: {
    date: 'Date',
    supporters: 'supporters',
    upvotes: 'upvotes',
    collaborators: 'Collaborators',
    bloggers: 'Bloggers',
    owner: 'Owner',
    public: 'Public',
    private: 'Private',
    lastUpdated: 'Last updated',
    canEdit: 'Can edit',
  },

  // Version Control
  versionControl: {
    saveVersion: 'Save Version',
    history: 'History',
    createVersion: 'Create Version',
    createDescription: 'Save the current state as a named version you can restore later.',
    versionTitle: 'Version Title',
    titlePlaceholder: 'e.g., Before major changes',
    save: 'Save',
    versionHistory: 'Version History',
    historyDescription: 'View and restore previous versions of this content.',
    searchVersions: 'Search versions...',
    noVersions: 'No versions yet. Create one to track your changes.',
    noMatchingVersions: 'No versions match your search.',
    restore: 'Restore',
    enterTitle: 'Please enter a version title',
    versionCreated: 'Version {{number}} created',
    createFailed: 'Failed to create version',
    restoredTo: 'Restored to version {{number}}',
    restoreFailed: 'Failed to restore version',
    titleUpdated: 'Version title updated',
    titleUpdateFailed: 'Failed to update version title',
    versionRestored: 'Version restored successfully',
    versionDeleted: 'Version deleted',
    updateFailed: 'Failed to update version',
    deleteFailed: 'Failed to delete version',
    notLoggedIn: 'You must be logged in to create versions',
    types: {
      manual: 'Manual',
      suggestionAdded: 'Suggestion Added',
      suggestionAccepted: 'Accepted',
      suggestionDeclined: 'Declined',
    },
  },

  // Mode Selector
  modeSelector: {
    title: 'Mode',
    selectMode: 'Select Mode',
    active: 'Active',
    modes: {
      edit: {
        label: 'Edit',
        description: 'Direct editing of content',
      },
      view: {
        label: 'View',
        description: 'Read-only viewing',
      },
      suggest: {
        label: 'Suggest',
        description: 'Create suggestions for review',
      },
      vote: {
        label: 'Vote',
        description: 'Vote on pending suggestions',
      },
    },
    errors: {
      onlyCollaborators: 'Only collaborators can change the editing mode',
      changeFailed: 'Failed to change mode',
    },
  },

  // Invite Dialog
  inviteDialog: {
    invite: 'Invite',
    title: 'Invite Collaborators',
    description: 'Search and select users to invite. They will be able to edit this content.',
    searchPlaceholder: 'Search by name, handle, or email...',
    noUsers: 'No users found.',
    invitedOne: 'Collaborator invited successfully',
    invitedMultiple: '{{count}} collaborators invited successfully',
    inviteFailed: 'Failed to invite collaborators',
  },
};
