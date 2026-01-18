export const authPageTranslations = {
  login: {
    title: 'Bei Polity anmelden',
    description: 'Gib deine E-Mail-Adresse ein und wir senden dir einen sicheren Magic Code',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'deine.email@beispiel.de',
    sendCode: 'Magic Code senden',
    sending: 'Wird gesendet...',
    footer: {
      noPassword: 'Kein Passwort erforderlich - wir senden dir stattdessen einen sicheren Code.',
      checkEmail: 'Prüfe deine E-Mails für den Bestätigungscode.',
    },
  },
  verify: {
    title: 'Bestätigungscode eingeben',
    description: 'Wir haben einen 6-stelligen Code gesendet an',
    codeLabel: 'Bestätigungscode',
    submit: 'Bestätigen und anmelden',
    verifying: 'Wird überprüft...',
    back: 'Zurück',
    resend: 'Erneut senden',
    footer: {
      checkSpam: 'Keine E-Mail erhalten? Prüfe deinen Spam-Ordner.',
      devNote: 'Entwicklungsmodus: Nutze Code',
    },
  },
  codeSent: {
    title: 'Code gesendet!',
    description: 'Wir haben einen Bestätigungscode gesendet an {{email}}',
    instructions: 'Prüfe deine E-Mails und gib den 6-stelligen Code auf der nächsten Seite ein.',
    backToEmail: 'E-Mail-Adresse ändern',
  },
  logout: {
    button: 'Abmelden',
    confirm: 'Möchtest du dich wirklich abmelden?',
    success: 'Du wurdest erfolgreich abgemeldet.',
  },
} as const;
