export default {
  COMMON: {
    SAVE_BTN: 'Speichern',
    RESTART: 'Neu starten',
    OPEN_LOG: 'Log Anzeigen'
  },
  MESSAGE: {
    SETTINGS: 'Einstellungen',
    PLUGIN_SETTINGS: 'Plugin Einstellungen',
    TOPIC: 'MQTT Topic',
    TOPIC_HINT:
      'Das Mqtt Topic in dem die Werte geschrieben werden sollen. Z.B. MessageCenter/messages. Kein Slash am Anfang oder Ende und keine Leer- oder Sonderzeichen. Das Topic wird automatisch abonniert.',
    INTERVAL: 'Abfrageinterval in Sekunden',
    INTERVAL_HINT: 'Spezifiziere hier, wie oft der Loxberry den Miniserver nach Meldungen abfragen soll.',
    MESSAGE_CENTER_ID: 'Loxone Message Center Id',
    NEED_MQTT: 'Um dises Plugin nutzen zu können, muss das MQTT Gateway Plugin in der Version >= 2.0.4 installiert sein.',
    ONLINE: 'Online',
    OFFLINE: 'Offline',
    BACKGROUND_SERVICE: 'Hintergrund Service',
    EXPLANATION: 'Erklärung der Meldungen',
    AUTOMATIC_RESOLVE: 'Automatisches Quittieren'
  },
  EXPLANATION: {
    HOWTO:
      'Das Plugin liest im definierten Interval die Systemmeldungen vom Miniserver aus und sendet diese an das definierte MQTT Topic. In der Loxone Config könnten die virtuellen Eingänge implementiert und ausgewertet werden.',
    MARK_MESSAGE:
      'Die Meldungen, können mit Hilfe eigener Logik automatisch quittiert werden. Zum automatischen lesen oder bestätigen der Meldung muss der Miniserver eine HTTP Anfrage an den Loxberry stellen und die EntryUuid der Meldung übergeben.',
    ENTRY_UUID: 'Text: Die eindeutige Id der Systemmeldung - kann benutzt werden um die Meldung zu lesen/bestätigen.',
    AFFECTED_NAME: 'Text: Name des Geräts, sofern eins betroffen ist.',
    DESC: 'Text: Eine ausfühliche Beschreibung des Problems, nützlich für TTS ausgaben',
    SEVERITY: 'Zahl: Die Warnstufe: 1: Info, 2: Warnung, >3: Fehler',
    TITLE: 'Text: Ein kurzer Titel des Fehlers',
    HAS_CONFIRM_ACTION: 'Digital: gibt an ob die Meldung bestätigt werden kann/muss.',
    READ_URL: 'URL zum automatischen lesen der Meldung',
    CONFIRM_URL: 'URL zum autimatschen bestätigen der Meldung',
    DOWNLOAD_OUTPUTS: 'Loxone Vorlage herunterladen',
    TEMPLATE_HELP: 'Loxone Dokumentation für Vorlagen',
    LOXONE_TEMPLATE_URL: 'https://www.loxone.com/dede/kb/vorlagen/'
  },
  VALIDATION: {
    REQUIRED: 'Diese Feld wird zwingend benötigt.',
    INVALID_TOPIC: 'Das Topic darf nur alphanumerisch sein und wird mit einem / gruppiert. Beispielsweise test/topic.',
    INVALID_INTERVAL: 'Bitte gebe eine gültige bereich zwischen 1 und 999 ein.'
  }
};
