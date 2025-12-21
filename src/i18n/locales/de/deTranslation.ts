import type { I18nLocale } from '../en/enTranslation';

// Using I18nLocale type to ensure compatibility with English translations
const deTranslation: I18nLocale = {
  home: {
    welcomeTitle: 'Willkommen bei Polity',
    welcomeSubtitle: 'Eine TanStack Router Demo mit dynamischer Navigation',
    hero: {
      title: 'Demokratie neu gedacht für das digitale Zeitalter',
      subtitle:
        'Gemeinschaften, Organisationen und Regierungen mit Werkzeugen für kollaborative Entscheidungsfindung stärken',
      getStarted: 'Jetzt starten',
      exploreFeatures: 'Funktionen erkunden',
    },
    cards: {
      navigation: {
        title: 'Navigation Demo',
        description: 'Erleben Sie unsere dynamische Navigation mit verschiedenen Layouts',
        content:
          'Testen Sie verschiedene Navigationstypen, Prioritäten und Bildschirmkonfigurationen.',
        button: 'Navigation Demo anzeigen',
      },
      features: {
        title: 'Features',
        description: 'Hauptfunktionen dieser Anwendung',
        items: [
          'Dynamische, konfigurierbare Navigation',
          'Reaktive Layouts für mobile und Desktop-Geräte',
          'Tastaturnavigation mit Shortcuts',
          'Kommandopalette (Drücken Sie ⌘K)',
          'Themenwechsel (hell/dunkel)',
        ],
      },
      techStack: {
        title: 'Tech-Stack',
        description: 'Verwendete Technologien',
        frontend: 'Frontend:',
        styling: 'Styling:',
        tooling: 'Tooling:',
        button: 'Demo starten',
      },
      test: 'fdf',
    },
  },
  navigation: {
    primary: {
      home: 'Startseite',
      features: 'Funktionen',
      solutions: 'Lösungen',
      pricing: 'Preise',
      support: 'Unterstützen',
      create: 'Erstellen',
      search: 'Suchen',
      dashboard: 'Dashboard',
      messages: 'Nachrichten',
      settings: 'Einstellungen',
      files: 'Dateien',
      editor: 'Editor',
      projects: 'Projekte',
      calendar: 'Kalender',
      todos: 'Aufgaben',
      notifications: 'Benachrichtigungen',
      groups: 'Gruppen',
    },
    secondary: {
      projects: {
        tasks: 'Aufgaben',
        tests: 'Tests',
      },
      dashboard: {
        analytics: 'Analytik',
        reports: 'Berichte',
      },
      calendar: {
        day: 'Tagesansicht',
        week: 'Wochenansicht',
        month: 'Monatsansicht',
      },
      event: {
        overview: 'Übersicht',
        agenda: 'Tagesordnung',
        stream: 'Stream',
        participants: 'Teilnehmer',
        positions: 'Positionen',
        notifications: 'Benachrichtigungen',
        network: 'Netzwerk',
        edit: 'Veranstaltung bearbeiten',
      },
      user: {
        profile: 'Profil',
        subscriptions: 'Abonnements',
        memberships: 'Mitgliedschaften',
        network: 'Netzwerk',
        meet: 'Treffen',
        edit: 'Profil bearbeiten',
      },
      group: {
        overview: 'Übersicht',
        editor: 'Dokumente',
        events: 'Veranstaltungen',
        amendments: 'Anträge',
        operation: 'Betrieb',
        network: 'Netzwerk',
        memberships: 'Mitglieder',
        notifications: 'Benachrichtigungen',
        edit: 'Gruppe bearbeiten',
      },
      amendment: {
        overview: 'Übersicht',
        text: 'Volltext',
        changeRequests: 'Änderungsanträge',
        discussions: 'Diskussionen',
        collaborators: 'Mitarbeiter',
        process: 'Prozess',
        notifications: 'Benachrichtigungen',
        edit: 'Amendment bearbeiten',
      },
      blog: {
        overview: 'Übersicht',
        bloggers: 'Blogger',
        notifications: 'Benachrichtigungen',
      },
    },
    toggles: {
      theme: {
        title: 'Theme',
        light: 'Licht-Modus',
        dark: 'Dunkel-Modus',
        system: 'System-Theme',
      },
      language: {
        title: 'Sprache ändern',
        english: 'English',
        german: 'Deutsch',
        moreLanguages: 'Weitere Sprachen...',
        changeSuccess: 'Sprache geändert zu Deutsch',
        changeDescription: 'Ihre Spracheinstellung wurde zu Deutsch aktualisiert.',
      },
      state: {
        asButton: 'Button-Ansicht',
        asButtonList: 'Button-Listen-Ansicht',
        asLabeledButtonList: 'Beschriftete Button-Listen-Ansicht',
      },
    },
    userMenu: {
      profile: 'Profil',
      settings: 'Einstellungen',
    },
  },
  loading: {
    page: 'Seite wird geladen...',
    navigation: 'Navigation...',
    general: 'Wird geladen...',
    compiling: 'Seite wird kompiliert...',
  },
  navigationDemo: {
    title: 'Dynamische Navigations-Demo',
    description: 'Testen Sie verschiedene Navigations-Konfigurationen',
    screenType: {
      title: 'Bildschirmtyp',
      mobile: 'Mobil',
      desktop: 'Desktop',
      automatic: 'Automatisch',
      description: 'Wechselt zwischen mobilem und Desktop-Modus basierend auf der Bildschirmbreite',
    },
    commandPalette: {
      title: 'Befehlspalette',
      placeholder: 'Befehle suchen...',
    },
    themeSettings: {
      title: 'Theme-Einstellungen',
      description:
        'Das Theme synchronisiert automatisch mit Ihrer Systemeinstellung. Sie können es auch manuell ändern.',
    },
    priority: {
      title: 'Priorität',
      primary: 'Primär',
      secondary: 'Sekundär',
      combined: 'Kombiniert',
    },
    currentConfig: {
      title: 'Aktuelle Konfiguration',
      state: 'Status',
      priority: 'Priorität',
      screen: 'Bildschirm',
    },
    stateSwitcher: {
      title: 'Status-Wechsler Verhalten',
      asButton: {
        title: 'asButton:',
        description: 'Status-Icons erscheinen horizontal im Vollbildoverlay',
      },
      asButtonList: {
        title: 'asButtonList:',
        description: '"Mehr"-Symbol, das bei Hover/Tap Status-Icons anzeigt',
      },
      asLabeledButtonList: {
        title: 'asLabeledButtonList:',
        description: 'Status-Icons werden horizontal in der Fußzeile angezeigt',
      },
    },
    sampleContent: {
      title: 'Beispielinhalt',
      description: 'Dieser Inhalt demonstriert, wie die Navigation das Seitenlayout beeinflusst',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
  },
  commandDialog: {
    placeholder: 'Geben Sie einen Befehl ein oder suchen Sie...',
    noResults: 'Keine Ergebnisse gefunden.',
    groups: {
      primaryNavigation: 'Primäre Navigation',
      secondaryNavigation: 'Sekundäre Navigation',
      projectsNavigation: 'Projekte Navigation',
      dashboardNavigation: 'Dashboard Navigation',
      settings: 'Einstellungen',
    },
    items: {
      changeTheme: 'Theme ändern',
      keyboardShortcuts: 'Tastenkürzel',
    },
  },
  plateJs: {
    blockContextMenu: {
      turnInto: 'Umwandeln in',
      paragraph: 'Absatz',
      heading2: 'Überschrift 2',
      heading3: 'Überschrift 3',
      blockquote: 'Blockzitat',
      indent: 'Einrücken',
      outdent: 'Ausrücken',
      align: 'Ausrichten',
      alignLeft: 'Links',
      alignCenter: 'Zentriert',
      alignRight: 'Rechts',
      askAI: 'KI fragen',
      delete: 'Löschen',
      duplicate: 'Duplizieren',
    },
    ai: {
      menu: {
        placeholder: 'Frage KI etwas...',
        thinking: 'Denke nach...',
        editing: 'Bearbeite...',
        writing: 'Schreibe...',
        stop: 'Stopp',
        accept: 'Akzeptieren',
        continueWriting: 'Weiterschreiben',
        discard: 'Verwerfen',
        emojify: 'Emojis hinzufügen',
        explain: 'Erklären',
        fixSpelling: 'Rechtschreibung & Grammatik korrigieren',
        generateMarkdownSample: 'Markdown-Beispiel generieren',
        generateMdxSample: 'MDX-Beispiel generieren',
        improveWriting: 'Schreibstil verbessern',
        insertBelow: 'Unten einfügen',
        makeLonger: 'Verlängern',
        makeShorter: 'Kürzen',
        replaceSelection: 'Auswahl ersetzen',
        simplifyLanguage: 'Sprache vereinfachen',
        addSummary: 'Zusammenfassung hinzufügen',
        tryAgain: 'Erneut versuchen',
      },
    },
    equation: {
      addTex: 'TeX-Gleichung hinzufügen',
      newEquation: 'Neue Gleichung',
      placeholder: {
        complex:
          'f(x) = \\begin{cases}\n  x^2, &\\quad x > 0 \\\\\n  0, &\\quad x = 0 \\\\\n  -x^2, &\\quad x < 0\n\\end{cases}',
        simple: 'E = mc^2',
      },
      done: 'Fertig',
    },
    comment: {
      edited: '(bearbeitet)',
      replyPlaceholder: 'Antworten...',
      edit: 'Kommentar bearbeiten',
      delete: 'Kommentar löschen',
      cancel: 'Abbrechen',
      save: 'Speichern',
    },
    headings: {
      heading1: 'Überschrift 1',
      heading2: 'Überschrift 2',
      heading3: 'Überschrift 3',
      heading4: 'Überschrift 4',
      heading5: 'Überschrift 5',
      heading6: 'Überschrift 6',
    },
    text: 'Text',
    lists: {
      bulleted: 'Aufzählungsliste',
      numbered: 'Nummerierte Liste',
      todo: 'Aufgabenliste',
      toggle: 'Ausklappbare Liste',
    },
    code: 'Code',
    quote: 'Zitat',
    layout: {
      threeColumns: '3 Spalten',
      callout: 'Hinweisfeld',
      column: 'Spalte',
    },
    toolbar: {
      turnInto: 'Umwandeln in',
      undo: 'Rückgängig',
      redo: 'Wiederholen',
      aiCommands: 'KI-Befehle',
      askAI: 'KI fragen',
      export: 'Exportieren',
      import: 'Importieren',
      insert: 'Einfügen',
      bold: 'Fett (⌘+B)',
      italic: 'Kursiv (⌘+I)',
      underline: 'Unterstrichen (⌘+U)',
      strikethrough: 'Durchgestrichen (⌘+⇧+M)',
      code: 'Code (⌘+E)',
      textColor: 'Textfarbe',
      backgroundColor: 'Hintergrundfarbe',
      highlight: 'Hervorheben',
      comment: 'Kommentar',
      fontSize: 'Schriftgröße',
      link: 'Link',
      tableButton: 'Tabelle', // Changed from 'table' to 'tableButton'
      emoji: 'Emoji',
      image: 'Bild',
      video: 'Video',
      audio: 'Audio',
      file: 'Datei',
      lineHeight: 'Zeilenhöhe',
      outdent: 'Einzug verringern',
      indent: 'Einzug erhöhen',
      more: 'Mehr',
      bulletedList: 'Aufzählungsliste',
      numberedList: 'Nummerierte Liste',
      todoList: 'Aufgabenliste',
      toggleList: 'Ausklappbare Liste',
      align: 'Ausrichten',
      editingMode: 'Bearbeitungsmodus',
      mode: {
        editing: 'Bearbeiten',
        viewing: 'Ansicht',
        suggestion: 'Vorschläge',
      },
      listTypes: {
        decimal: 'Dezimal (1, 2, 3)',
        lowerAlpha: 'Kleinbuchstaben (a, b, c)',
        upperAlpha: 'Großbuchstaben (A, B, C)',
        lowerRoman: 'Kleine röm. Ziffern (i, ii, iii)',
        upperRoman: 'Große röm. Ziffern (I, II, III)',
        bulleted: {
          default: 'Standard',
          circle: 'Kreis',
          square: 'Quadrat',
        },
      },
      groups: {
        basicBlocks: 'Grundlegende Blöcke',
        lists: 'Listen',
        media: 'Medien',
        advancedBlocks: 'Erweiterte Blöcke',
        inline: 'Inline',
        ai: 'AI',
      },
      divider: 'Trennlinie',
      date: 'Datum',
      inlineEquation: 'Inline-Gleichung',
      tableOfContents: {
        title: 'Inhaltsverzeichnis',
        createHeading: 'Erstellen Sie eine Überschrift, um das Inhaltsverzeichnis anzuzeigen.',
      },
      embed: 'Einbetten',
      alert: 'Hinweis',
      keyboardInput: 'Tastatureingabe',
      superscript: 'Hochgestellt',
      subscript: 'Tiefgestellt',
      deleteTable: 'Tabelle löschen',
      deleteColumn: 'Spalte löschen',
      deleteRow: 'Zeile löschen',
      insertRow: 'Zeile einfügen',
      insertColumn: 'Spalte einfügen',
      insertTable: 'Tabelle einfügen',
      mergeCells: 'Zellen zusammenführen',
      unmergeCells: 'Zellen teilen',
      uploadFromComputer: 'Vom Computer hochladen',
      insertViaURL: 'Über URL einfügen',
      cancel: 'Abbrechen',
      accept: 'Akzeptieren',
      equation: 'Als Gleichung markieren',
      insertAudio: 'Audio einfügen',
      insertFile: 'Datei einfügen',
      insertImage: 'Bild einfügen',
      insertVideo: 'Video einfügen',
      dragToMove: 'Zum Bewegen ziehen',
      turnOffSuggesting: 'Vorschlagsmodus ausschalten',
      suggestionEdits: 'Änderungsvorschläge',
      formatCode: 'Code formatieren',
      toggleSidebar: 'Seitenleiste umschalten',
      search: 'Suchen',
      clear: 'Löschen',
      custom: 'Custom',
      openInNewTab: 'Link in neuem Tab öffnen',
      editLink: 'Link bearbeiten',
      unlink: 'Link entfernen',
      importFromHTML: 'Aus HTML importieren',
      importFromMarkdown: 'Aus Markdown importieren',
      exportAsHTML: 'Als HTML exportieren',
      exportAsPDF: 'Als PDF exportieren',
      exportAsImage: 'Als Bild exportieren',
      exportAsMarkdown: 'Als Markdown exportieren',
      searchLanguage: 'Sprache suchen...',
      noLanguageFound: 'Keine Sprache gefunden.',
      pasteLink: 'Link einfügen',
      textToDisplay: 'Anzuzeigender Text',
      colors: 'Farben',
      customColors: 'Benutzerdefinierte Farben',
      defaultColors: 'Standardfarben',
      table: {
        title: 'Tabelle',
        cell: {
          title: 'Zelle',
          merge: 'Zellen zusammenführen',
          split: 'Zelle teilen',
        },
        row: {
          title: 'Zeile',
          insertBefore: 'Zeile darüber einfügen',
          insertAfter: 'Zeile darunter einfügen',
          delete: 'Zeile löschen',
        },
        column: {
          title: 'Spalte',
          insertBefore: 'Spalte davor einfügen',
          insertAfter: 'Spalte danach einfügen',
          delete: 'Spalte löschen',
        },
        delete: 'Tabelle löschen',
        backgroundColor: 'Hintergrundfarbe',
        borders: {
          top: 'Oberer Rand',
          right: 'Rechter Rand',
          bottom: 'Unterer Rand',
          left: 'Linker Rand',
          none: 'Kein Rand',
          outside: 'Äußere Ränder',
        },
      },
    },
    media: {
      youtube: 'YouTube',
      embed: 'Einbettung',
      toolbar: {
        embedLinkPlaceholder: 'Link zum Einbetten einfügen...',
        editLink: 'Link bearbeiten',
        caption: 'Beschriftung',
      },
      caption: {
        placeholder: 'Beschreibung hinzufügen...',
      },
    },
    emoji: {
      categories: {
        activity: 'Aktivität',
        custom: 'Benutzerdefiniert',
        flags: 'Flaggen',
        foods: 'Essen & Trinken',
        frequent: 'Häufig verwendet',
        nature: 'Tiere & Natur',
        objects: 'Objekte',
        people: 'Smileys & Menschen',
        places: 'Reisen & Orte',
        symbols: 'Symbole',
      },
      search: 'Emoji suchen...',
      searchResults: 'Suchergebnisse',
      clear: 'Löschen',
      notFound: 'Keine Emojis gefunden',
      tryAnotherSearch: 'Versuchen Sie eine andere Suche',
      pickEmoji: 'Wählen Sie ein Emoji...',
      categoryTitle: 'Emoji-Kategorien',
    },
    errors: {
      invalidUrl: 'Ungültige URL',
    },
    blockSuggestion: {
      lineBreaks: 'Zeilenumbrüche',
      delete: 'Löschen:',
      add: 'Hinzufügen:',
      with: 'mit:',
      replace: 'Ersetzen:',
      un: 'Nicht',
    },
  },
  media: {
    captionPlaceholder: 'Beschriftung eingeben...',
  },
  mediaUpload: {
    errors: {
      invalidFileSize: 'Die Größe der Dateien {{files}} ist ungültig',
      invalidFileType: 'Der Dateityp von {{files}} ist ungültig',
      tooLarge: 'Die Größe der Dateien {{files}} ist größer als {{maxFileSize}}',
      tooLessFiles: 'Die Mindestanzahl an Dateien ist {{minFileCount}} für {{fileType}}',
      tooManyFiles: 'Die maximale Anzahl an Dateien ist {{maxFileCount}}{{forFileType}}',
    },
  },
  dateElement: {
    pickDate: 'Datum auswählen',
    today: 'Heute',
    yesterday: 'Gestern',
    tomorrow: 'Morgen',
  },
  columnElement: {
    dragToMove: 'Ziehen, um Spalte zu verschieben',
  },
  auth: {
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
  },
  common: {
    goBack: 'Zurück',
    goHome: 'Zur Startseite',
    search: 'Suchen',
  },
  landing: {
    features: {
      title: 'Funktionen',
      subtitle: 'Alles was Sie für demokratische Zusammenarbeit und Entscheidungsfindung brauchen',
      userPages: {
        title: 'Benutzerprofile',
        description:
          'Erstellen Sie detaillierte Benutzerseiten, bauen Sie Netzwerke auf und verbinden Sie sich mit Gleichgesinnten auf der Plattform.',
      },
      groups: {
        title: 'Gruppen',
        description:
          'Bilden Sie Gemeinschaften, organisieren Sie Teams und arbeiten Sie an gemeinsamen Zielen mit leistungsstarken Gruppenverwaltungstools.',
      },
      events: {
        title: 'Veranstaltungen',
        description:
          'Planen Sie Meetings, Bürgerversammlungen und Konferenzen mit integrierter Terminplanung und Teilnehmerverwaltung.',
      },
      amendments: {
        title: 'Anträge',
        description:
          'Schlagen Sie vor, diskutieren Sie und verfolgen Sie politische Änderungen mit transparenten Antragsprozessen und Versionskontrolle.',
      },
      agendas: {
        title: 'Tagesordnungen',
        description:
          'Strukturieren Sie Meetings und Veranstaltungen mit kollaborativem Tagesordnungsaufbau und Echtzeit-Updates.',
      },
      search: {
        title: 'Erweiterte Suche',
        description:
          'Finden Sie Personen, Gruppen, Veranstaltungen und Dokumente schnell mit leistungsstarken semantischen Suchfunktionen.',
      },
      calendar: {
        title: 'Kalender',
        description:
          'Verwalten Sie Ihren Zeitplan mit integrierten Kalenderansichten für alle Ihre Veranstaltungen und Meetings.',
      },
      tasks: {
        title: 'Aufgaben',
        description:
          'Bleiben Sie organisiert mit persönlichem und geteiltem Aufgabenmanagement, das in die gesamte Plattform integriert ist.',
      },
      messages: {
        title: 'Nachrichten',
        description:
          'Kommunizieren Sie direkt mit Einzelpersonen und Gruppen über Echtzeit-Messaging.',
      },
      notifications: {
        title: 'Benachrichtigungen',
        description:
          'Bleiben Sie informiert mit intelligenten Benachrichtigungen über wichtige Updates und Aktivitäten.',
      },
      cta: {
        title: 'Bereit loszulegen?',
        subtitle:
          'Schließen Sie sich Tausenden von Organisationen an, die Polity nutzen, um bessere Entscheidungen gemeinsam zu treffen',
      },
    },
    solutions: {
      title: 'Lösungen',
      subtitle:
        'Maßgeschneidert für jeden Organisationstyp und jede Person, die sich demokratischer Zusammenarbeit verschrieben hat',
      humans: {
        title: 'Für Menschen',
        description:
          'Befähigen Sie Einzelpersonen, an demokratischen Prozessen teilzunehmen, lokale Initiativen zu organisieren und mit Gemeinschaften zusammenzuarbeiten.',
      },
      parties: {
        title: 'Für politische Parteien',
        description:
          'Modernisieren Sie Parteioperationen mit digitalen Tools für Mitgliederengagement, Politikentwicklung und Kampagnenkoordination.',
      },
      government: {
        title: 'Für Regierungen',
        description:
          'Verbessern Sie Transparenz und Bürgerbeteiligung mit Tools für öffentliche Konsultation, Gesetzgebungsverfolgung und Gemeinschaftsengagement.',
      },
      ngos: {
        title: 'Für NGOs',
        description:
          'Stärken Sie Advocacy-Bemühungen mit kollaborativen Tools für Koalitionsbildung, Kampagnenmanagement und Stakeholder-Engagement.',
      },
      corporations: {
        title: 'Für Unternehmen',
        description:
          'Fördern Sie Mitarbeiterengagement und transparente Governance mit Tools für interne Demokratie und Stakeholder-Konsultation.',
      },
      media: {
        title: 'Für Medien',
        description:
          'Ermöglichen Sie partizipativen Journalismus und Gemeinschaftsengagement mit Tools für kollaborative Berichterstattung und Publikumsinteraktion.',
      },
      cta: {
        title: 'Finden Sie Ihre perfekte Lösung',
        subtitle: 'Egal welche Organisationsart, Polity hat die Tools, die Sie brauchen',
      },
    },
    pricing: {
      title: 'Preise',
      subtitle:
        'Transparente Preise, die mit Ihren Bedürfnissen wachsen. Keine versteckten Gebühren.',
      free: {
        name: 'Kostenlos',
        description: 'Perfekt für Einzelpersonen und kleine Gruppen zum Einstieg',
        cta: 'Jetzt starten',
      },
      runningCosts: {
        name: 'Betriebskosten',
        price: '€2/Monat',
        description: 'Unterstützen Sie unsere Infrastruktur und erhalten Sie erweiterte Funktionen',
        cta: 'Beitragen',
      },
      development: {
        name: 'Entwicklung',
        price: '€10/Monat',
        description: 'Helfen Sie uns, die Zukunft zu gestalten und alle Funktionen freizuschalten',
        cta: 'Entwicklung unterstützen',
      },
      whySubscription: {
        title: 'Warum Abonnementstufen?',
        intro:
          'Polity basiert auf Transparenz und Community-Unterstützung. Unsere Preise spiegeln unsere tatsächlichen Kosten und Entwicklungsbedürfnisse wider:',
      },
      enterprise: {
        title: 'Enterprise & maßgeschneiderte Lösungen',
        description:
          'Benötigen Sie benutzerdefinierte Funktionen, dediziertes Hosting oder On-Premise-Bereitstellung? Wir bieten maßgeschneiderte Lösungen für größere Organisationen.',
        cta: 'Vertrieb kontaktieren',
      },
    },
  },
  pages: {
    groups: {
      childGroups: {
        title: 'Untergeordnete Gruppen',
        description: 'Gruppen, die dieser Gruppe untergeordnet sind',
      },
    },
    users: {
      groups: {
        title: 'Gruppen',
        description: 'Gruppen, in denen dieser Benutzer Mitglied ist',
      },
    },
  },
  components: {
    infoTabs: {
      about: 'Über',
      contact: 'Kontakt',
      locationAndDate: 'Ort & Zeit',
      noInformation: 'Keine Informationen verfügbar',
      noContact: 'Keine Kontaktinformationen verfügbar',
      labels: {
        email: 'E-Mail',
        twitter: 'Twitter',
        website: 'Webseite',
        location: 'Standort',
        region: 'Region',
        country: 'Land',
      },
    },
    actionBar: {
      subscribe: 'Abonnieren',
      unsubscribe: 'Abbestellen',
      requestToJoin: 'Beitrittsanfrage',
      leaveGroup: 'Gruppe verlassen',
      acceptInvitation: 'Einladung annehmen',
      requestPending: 'Anfrage ausstehend',
      linkGroup: 'Gruppe verknüpfen',
    },
    badges: {
      public: 'Öffentlich',
      private: 'Privat',
    },
    labels: {
      organizedBy: 'Organisiert von',
      proposedBy: 'Vorgeschlagen von',
      partOf: 'Teil von',
      participants: 'Teilnehmer',
      subscribers: 'Abonnenten',
      collaborators: 'Mitarbeiter',
      supporters: 'Unterstützer',
      supportingGroups: 'Unterstützende Gruppen',
      supportingMembers: 'Unterstützende Mitglieder',
      clones: 'Klone',
      members: 'Mitglieder',
      events: 'Veranstaltungen',
      amendments: 'Anträge',
      groups: 'Gruppen',
      likes: 'Likes',
      comments: 'Kommentare',
      capacity: 'Kapazität',
      eventDetails: 'Veranstaltungsdetails',
      location: 'Standort',
      processStatus: 'Prozessstatus',
      changeRequests: 'Änderungsanträge',
      elections: 'Wahlen',
      openChangeRequests: 'Offene Änderungsanträge',
    },
  },
  errors: {
    pageNotFound: {
      title: 'Seite nicht gefunden',
      description: 'Die gesuchte Seite existiert nicht oder wurde verschoben.',
      helpText: 'Benötigen Sie Hilfe beim Finden?',
    },
  },
};

export default deTranslation;
