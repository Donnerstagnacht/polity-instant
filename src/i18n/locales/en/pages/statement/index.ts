export const statementPageTranslations = {
  title: 'Statement',
  description: 'View and discuss this statement.',
  author: 'Author',
  createdAt: 'Created',
  updatedAt: 'Updated',
  edit: 'Edit',
  delete: 'Delete',
  share: 'Share',
  reactions: {
    title: 'Reactions',
    agree: 'Agree',
    disagree: 'Disagree',
    neutral: 'Neutral',
  },
  comments: {
    title: 'Comments',
    placeholder: 'Add a comment...',
    submit: 'Comment',
    noComments: 'No comments yet',
    reply: 'Reply',
    delete: 'Delete',
  },
  related: {
    title: 'Related Statements',
    noRelated: 'No related statements',
  },
  empty: {
    title: 'Statement not found',
    description: 'This statement does not exist or has been removed.',
    backToHome: 'Back to Home',
  },
} as const;
