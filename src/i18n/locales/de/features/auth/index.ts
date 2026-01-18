export const authTranslations = {
  login: {
    title: 'Bei Polity anmelden',
    description:
      'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen sicheren Magic-Code',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'ihre.email@beispiel.de',
    sendCode: 'Magic-Code senden',
    sending: 'Wird gesendet...',
    footer: {
      noPassword:
        'Kein Passwort erforderlich - wir senden Ihnen stattdessen einen sicheren Code.',
      checkEmail: 'Überprüfen Sie Ihre E-Mails für den Bestätigungscode.',
    },
  },
  verify: {
    title: 'Bestätigungscode eingeben',
    description: 'Wir haben einen 6-stelligen Code gesendet an',
    codeLabel: 'Bestätigungscode',
    submit: 'Verifizieren und anmelden',
    verifying: 'Verifiziere...',
    back: 'Zurück',
    resend: 'Erneut senden',
    footer: {
      checkSpam: 'Keine E-Mail erhalten? Überprüfen Sie Ihren Spam-Ordner.',
      devNote: 'Entwicklungsmodus: Code verwenden',
    },
  },
  codeSent: {
    title: 'Code gesendet!',
    description: 'Wir haben einen Bestätigungscode an {{email}} gesendet',
    instructions:
      'Überprüfen Sie Ihre E-Mails und geben Sie den 6-stelligen Code auf der nächsten Seite ein.',
    backToEmail: 'E-Mail-Adresse ändern',
  },
  logout: {
    button: 'Abmelden',
    confirm: 'Sind Sie sicher, dass Sie sich abmelden möchten?',
    success: 'Sie wurden erfolgreich abgemeldet.',
  },
  onboarding: {
    welcome: 'Willkommen bei Polity!',
    nameStep: {
      title: 'Wie heißt du?',
      description: 'Damit andere dich erkennen können',
      firstName: 'Vorname',
      lastName: 'Nachname',
      firstNamePlaceholder: 'Gib deinen Vornamen ein',
      lastNamePlaceholder: 'Gib deinen Nachnamen ein',
      validation: {
        required: 'Dieses Feld ist erforderlich',
        tooShort: 'Mindestens 2 Zeichen erforderlich',
        tooLong: 'Maximal 50 Zeichen erlaubt',
      },
      continue: 'Weiter',
    },
    groupStep: {
      title: 'Finde deine Gruppe',
      description: 'Suche nach einem Ort oder einer Gruppe, in der du aktiv bist',
      searchPlaceholder: 'Gruppen oder Orte suchen...',
      noResults: 'Keine Gruppen gefunden',
      skip: 'Überspringen',
      continue: 'Weiter',
    },
    confirmStep: {
      title: 'Dieser Gruppe beitreten?',
      description:
        'Möchtest du in dieser Gruppe mitarbeiten und eine Beitrittsanfrage senden?',
      yes: 'Ja, Anfrage senden',
      no: 'Nein, einfach weitermachen',
      requestSending: 'Anfrage wird gesendet...',
      requestSent: 'Anfrage gesendet!',
    },
    summaryStep: {
      title: 'Alles erledigt!',
      description: 'Das haben wir für dich getan:',
      nameUpdated: 'Name gesetzt auf',
      groupSelected: 'Gruppe ausgewählt',
      membershipRequested: 'Beitrittsanfrage gesendet an',
      noGroup: 'Keine Gruppe ausgewählt',
      goToProfile: 'Zu meinem Profil',
      goToGroup: 'Zur Gruppe',
      showAssistant: 'Zeig mir meinen Assistenten',
    },
    ariaKaiStep: {
      title: 'Willkommen bei Polity!',
      subtitle: 'Lerne Aria & Kai kennen, deine persönlichen Assistenten',
      intro: 'Hey! Wir sind <1>Aria & Kai</1> und wir sind hier, um dir zu helfen, Polity zu erkunden und das Beste aus allen Funktionen herauszuholen.',
      helpText: 'Wann immer du Hilfe, Tipps oder Informationen über Gruppen, Events, Anträge und mehr brauchst, <1>findest du uns in deinen Nachrichten</1>. Wir sind immer bereit zu helfen!',
      quickTip: 'Schneller Tipp:',
      tipText: 'Wir haben bereits eine Unterhaltung mit dir begonnen. Klicke unten, um zu sehen, wo du uns immer finden kannst!',
      dontShowAgain: 'Diese Einführung nicht mehr anzeigen',
      continue: 'Weiter',
    },
  },
} as const;
