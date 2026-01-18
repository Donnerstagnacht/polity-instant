export const statementPageTranslations = {
  title: 'Stellungnahme',
  description: 'Zeige diese Stellungnahme an und diskutiere darüber.',
  author: 'Autor',
  createdAt: 'Erstellt',
  updatedAt: 'Aktualisiert',
  edit: 'Bearbeiten',
  delete: 'Löschen',
  share: 'Teilen',
  reactions: {
    title: 'Reaktionen',
    agree: 'Zustimmen',
    disagree: 'Ablehnen',
    neutral: 'Neutral',
  },
  comments: {
    title: 'Kommentare',
    placeholder: 'Kommentar hinzufügen...',
    submit: 'Kommentieren',
    noComments: 'Noch keine Kommentare',
    reply: 'Antworten',
    delete: 'Löschen',
  },
  related: {
    title: 'Verwandte Stellungnahmen',
    noRelated: 'Keine verwandten Stellungnahmen',
  },
  empty: {
    title: 'Stellungnahme nicht gefunden',
    description: 'Diese Stellungnahme existiert nicht oder wurde entfernt.',
    backToHome: 'Zurück zur Startseite',
  },
} as const;
