/**
 * Unified Editor Translations - German
 */

export const editor = {
  // General
  description: 'Bearbeite den Inhalt. Änderungen werden automatisch gespeichert.',

  // Header
  header: {
    titlePlaceholder: 'Titel eingeben...',
    untitled: 'Ohne Titel',
    saving: 'Speichern...',
    saveFailed: 'Speichern fehlgeschlagen',
    unsavedChanges: 'Ungespeicherte Änderungen',
    allSaved: 'Alle Änderungen gespeichert',
  },

  // Navigation
  navigation: {
    backToAmendment: 'Zurück zum Antrag',
    backToBlog: 'Zurück zum Blog',
    backToDocuments: 'Zurück zu Dokumenten',
    backToGroup: 'Zurück zur Gruppe',
  },

  // Errors
  errors: {
    notFound: 'Inhalt nicht gefunden. Das Element wurde möglicherweise gelöscht.',
    noAccess: 'Du hast keinen Zugriff auf diesen Inhalt.',
  },

  // Metadata
  metadata: {
    date: 'Datum',
    supporters: 'Unterstützer',
    upvotes: 'Upvotes',
    collaborators: 'Mitarbeiter',
    bloggers: 'Blogger',
    owner: 'Besitzer',
    public: 'Öffentlich',
    private: 'Privat',
    lastUpdated: 'Zuletzt aktualisiert',
    canEdit: 'Kann bearbeiten',
  },

  // Version Control
  versionControl: {
    saveVersion: 'Version speichern',
    history: 'Verlauf',
    createVersion: 'Version erstellen',
    createDescription:
      'Speichere den aktuellen Stand als benannte Version, die du später wiederherstellen kannst.',
    versionTitle: 'Versionsname',
    titlePlaceholder: 'z.B. Vor größeren Änderungen',
    save: 'Speichern',
    versionHistory: 'Versionsverlauf',
    historyDescription: 'Zeige frühere Versionen an und stelle sie wieder her.',
    searchVersions: 'Versionen suchen...',
    noVersions: 'Noch keine Versionen. Erstelle eine, um deine Änderungen zu verfolgen.',
    noMatchingVersions: 'Keine Versionen entsprechen deiner Suche.',
    restore: 'Wiederherstellen',
    enterTitle: 'Bitte gib einen Versionsnamen ein',
    versionCreated: 'Version {{number}} erstellt',
    createFailed: 'Version konnte nicht erstellt werden',
    restoredTo: 'Wiederhergestellt zu Version {{number}}',
    restoreFailed: 'Version konnte nicht wiederhergestellt werden',
    titleUpdated: 'Versionsname aktualisiert',
    titleUpdateFailed: 'Versionsname konnte nicht aktualisiert werden',
    versionRestored: 'Version erfolgreich wiederhergestellt',
    versionDeleted: 'Version gelöscht',
    updateFailed: 'Version konnte nicht aktualisiert werden',
    deleteFailed: 'Version konnte nicht gelöscht werden',
    notLoggedIn: 'Du musst angemeldet sein, um Versionen zu erstellen',
    types: {
      manual: 'Manuell',
      suggestionAdded: 'Vorschlag hinzugefügt',
      suggestionAccepted: 'Angenommen',
      suggestionDeclined: 'Abgelehnt',
    },
  },

  // Mode Selector
  modeSelector: {
    title: 'Modus',
    selectMode: 'Modus auswählen',
    active: 'Aktiv',
    modes: {
      edit: {
        label: 'Bearbeiten',
        description: 'Direktes Bearbeiten des Inhalts',
      },
      view: {
        label: 'Ansehen',
        description: 'Nur-Lese-Ansicht',
      },
      suggest: {
        label: 'Vorschlagen',
        description: 'Vorschläge zur Überprüfung erstellen',
      },
      vote: {
        label: 'Abstimmen',
        description: 'Über ausstehende Vorschläge abstimmen',
      },
    },
    errors: {
      onlyCollaborators: 'Nur Mitarbeiter können den Bearbeitungsmodus ändern',
      changeFailed: 'Modus konnte nicht geändert werden',
    },
  },

  // Invite Dialog
  inviteDialog: {
    invite: 'Einladen',
    title: 'Mitarbeiter einladen',
    description: 'Suche und wähle Benutzer zum Einladen. Sie können diesen Inhalt dann bearbeiten.',
    searchPlaceholder: 'Nach Name, Handle oder E-Mail suchen...',
    noUsers: 'Keine Benutzer gefunden.',
    invitedOne: 'Mitarbeiter erfolgreich eingeladen',
    invitedMultiple: '{{count}} Mitarbeiter erfolgreich eingeladen',
    inviteFailed: 'Einladung der Mitarbeiter fehlgeschlagen',
  },
};
