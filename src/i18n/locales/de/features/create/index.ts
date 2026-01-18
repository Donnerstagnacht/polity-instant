export const createTranslations = {
  title: 'Erstellen',
  description: 'Neue Inhalte erstellen',
  dashboard: {
    title: 'Erstellen',
    description: 'Was möchtest du erstellen?',
  },
  types: {
    group: {
      title: 'Gruppe',
      description: 'Neue Gruppe oder Organisation erstellen',
    },
    event: {
      title: 'Veranstaltung',
      description: 'Neues Event oder Meeting planen',
    },
    amendment: {
      title: 'Antrag',
      description: 'Neuen Antrag oder Politikänderung vorschlagen',
    },
    blog: {
      title: 'Blog',
      description: 'Neuen Blogbeitrag schreiben',
    },
    statement: {
      title: 'Stellungnahme',
      description: 'Deine Position zu einem Thema teilen',
    },
    todo: {
      title: 'Aufgabe',
      description: 'Neue Aufgabe zur Nachverfolgung hinzufügen',
    },
    document: {
      title: 'Dokument',
      description: 'Kollaboratives Dokument erstellen',
    },
    position: {
      title: 'Position',
      description: 'Neue Position in einer Organisation erstellen',
    },
    agendaItem: {
      title: 'Tagesordnungspunkt',
      description: 'Punkt zur Event-Agenda hinzufügen',
    },
    electionCandidate: {
      title: 'Wahlkandidat',
      description: 'Als Kandidat für eine Wahl registrieren',
    },
  },
  form: {
    title: 'Titel',
    titlePlaceholder: 'Titel eingeben',
    description: 'Beschreibung',
    descriptionPlaceholder: 'Beschreibung eingeben',
    submit: 'Erstellen',
    cancel: 'Abbrechen',
    creating: 'Wird erstellt...',
  },
  success: {
    title: 'Erfolgreich erstellt',
    description: 'Dein/e {{type}} wurde erstellt.',
    viewButton: 'Ansehen',
    createAnother: 'Weiteren erstellen',
  },
  errors: {
    failed: 'Fehler beim Erstellen von {{type}}',
    titleRequired: 'Titel ist erforderlich',
    invalidData: 'Bitte überprüfe deine Eingabe',
  },
} as const;
