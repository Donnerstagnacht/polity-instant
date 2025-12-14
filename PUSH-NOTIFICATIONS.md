# Push-Benachrichtigungen Setup

Diese Anleitung beschreibt, wie Sie Push-Benachrichtigungen in der Polity PWA einrichten und verwenden.

## Übersicht

Das Push-Benachrichtigungssystem ermöglicht es Nutzern, Benachrichtigungen zu erhalten, auch wenn die App geschlossen ist. Die Implementierung nutzt die Web Push API mit VAPID-Authentifizierung und benötigt **keine** Accounts bei Google, Apple oder Microsoft.

## Funktionsweise

1. **Nutzer aktiviert Push-Benachrichtigungen** in der App
2. **Browser registriert Push-Subscription** mit seinem Push-Service
3. **Subscription wird in InstantDB gespeichert** (pro Nutzer/Gerät)
4. **Bei neuer Benachrichtigung**:
   - Benachrichtigung wird in InstantDB erstellt (Real-time Websocket)
   - Push-API sendet Benachrichtigung an alle registrierten Geräte
   - Browser zeigt OS-Benachrichtigung an
5. **Nutzer klickt auf Benachrichtigung** → App öffnet sich mit entsprechendem Link

## Setup-Schritte

### 1. VAPID-Keys generieren

VAPID (Voluntary Application Server Identification) Keys sind notwendig für die Authentifizierung bei Push-Services.

```bash
node scripts/generate-vapid-keys.ts
```

Das Script gibt die Keys aus:

```
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_EMAIL="mailto:your-email@example.com"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."  # Gleicher Wert wie VAPID_PUBLIC_KEY
```

### 2. Environment-Variablen konfigurieren

#### Lokal (.env)

Kopieren Sie die generierten Keys in Ihre `.env` Datei:

```env
# Web Push Notifications (VAPID Keys)
VAPID_PUBLIC_KEY="BJA1BnRmaQSqdb_n5rxWGagOfB4MOcngratPoCuDYeA2sZ3lq8qqNwgZgf6tru2l93K434GH26BjII1HjHuEoIk"
VAPID_PRIVATE_KEY="XZH4AlUudZ7lBLvVGkIc1MjoI_poRXSqFgG5Cj-p_lA"
VAPID_EMAIL="mailto:your-email@example.com"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BJA1BnRmaQSqdb_n5rxWGagOfB4MOcngratPoCuDYeA2sZ3lq8qqNwgZgf6tru2l93K434GH26BjII1HjHuEoIk"
```

⚠️ **WICHTIG**: Ersetzen Sie `your-email@example.com` mit Ihrer echten E-Mail-Adresse!

#### Vercel (Production)

Fügen Sie die Keys zu Ihren Vercel Environment Variables hinzu:

1. Gehen Sie zu Ihrem Vercel-Projekt → Settings → Environment Variables
2. Fügen Sie die folgenden Variablen hinzu:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_EMAIL`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (gleicher Wert wie `VAPID_PUBLIC_KEY`)
3. Stellen Sie sicher, dass die Variablen für alle Environments (Production, Preview, Development) verfügbar sind

### 3. InstantDB Schema aktualisieren

Das Schema wurde bereits um die `pushSubscriptions` Entität erweitert. Pushen Sie das Schema zu InstantDB:

```bash
npm run push-schema  # Falls Sie ein solches Script haben
```

Oder manuell in der InstantDB Console:

1. Öffnen Sie https://instantdb.com/dash
2. Gehen Sie zu Ihrem App → Schema
3. Das Schema in `instant.schema.ts` sollte die `pushSubscriptions` Entität enthalten

### 4. Build & Deploy

```bash
npm run build
npm run start
# oder
vercel --prod
```

## Verwendung

### 1. Push-Benachrichtigungen in UI integrieren

Die `PushNotificationToggle` Component bietet verschiedene Varianten:

#### In einer Settings-Seite (Card-Variante)

```tsx
import { PushNotificationToggle } from '@/components/push-notification-toggle';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1>Einstellungen</h1>
      <PushNotificationToggle variant="card" showDescription />
    </div>
  );
}
```

#### In einem Header/Toolbar (Minimal-Variante)

```tsx
import { PushNotificationToggle } from '@/components/push-notification-toggle';

export function Header() {
  return (
    <header>
      <nav>
        {/* ... andere Navigation ... */}
        <PushNotificationToggle variant="minimal" />
      </nav>
    </header>
  );
}
```

#### Custom Implementation mit Hook

```tsx
import { usePushSubscription } from '@/hooks/usePushSubscription';

export function CustomNotificationToggle() {
  const { isSupported, isSubscribed, isLoading, permission, error, subscribe, unsubscribe } =
    usePushSubscription();

  if (!isSupported) {
    return <div>Ihr Browser unterstützt keine Push-Benachrichtigungen</div>;
  }

  return (
    <button onClick={isSubscribed ? unsubscribe : subscribe} disabled={isLoading}>
      {isSubscribed ? 'Deaktivieren' : 'Aktivieren'}
    </button>
  );
}
```

### 2. Benachrichtigungen versenden

Push-Benachrichtigungen werden automatisch versendet, wenn Sie eine Benachrichtigung über die Helper-Funktionen erstellen:

```tsx
import { db } from '@/db';
import { sendMembershipApprovedNotification } from '@/utils/notification-helpers';

// Beispiel: Mitgliedschaft genehmigt
const transactions = await sendMembershipApprovedNotification(
  auth.id, // senderId
  userId, // recipientUserId
  groupId, // groupId
  'group' // entityType
);

await db.transact(transactions);
// → Push-Benachrichtigung wird automatisch versendet!
```

## Browser-Kompatibilität

### Desktop

- ✅ Chrome/Edge 50+
- ✅ Firefox 44+
- ✅ Safari 16+ (macOS 13+)
- ❌ Safari < 16

### Mobile

- ✅ Chrome Android 50+
- ✅ Firefox Android 48+
- ✅ Samsung Internet 5+
- ⚠️ Safari iOS 16.4+ (nur mit "Add to Home Screen")
- ❌ Safari iOS < 16.4

### Wichtige Einschränkungen

#### iOS Safari

- Push-Benachrichtigungen funktionieren **nur** wenn die PWA zum Home Screen hinzugefügt wurde
- Nutzer muss:
  1. Website in Safari öffnen
  2. "Teilen" → "Zum Home-Bildschirm" auswählen
  3. PWA vom Home Screen öffnen
  4. Push-Benachrichtigungen aktivieren

#### Browser ohne Support

Die App zeigt automatisch einen entsprechenden Hinweis an, wenn der Browser Push-Benachrichtigungen nicht unterstützt.

## Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  (PushNotificationToggle Component)                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   usePushSubscription Hook                   │
│  • Request Permission                                        │
│  • Register Subscription with Service Worker                 │
│  • Store Subscription in InstantDB                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Worker (custom-sw.js)              │
│  • Listen for 'push' events                                 │
│  • Show notification with registration.showNotification()   │
│  • Handle 'notificationclick' events                        │
└─────────────────────────────────────────────────────────────┘
                   │
                   │ Push Event
                   │
┌─────────────────────────────────────────────────────────────┐
│              Browser Push Service (Google/Mozilla/Apple)     │
│  • Receives push from your server                           │
│  • Wakes up Service Worker                                  │
│  • Delivers push event                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Web Push Protocol
                   │
┌─────────────────────────────────────────────────────────────┐
│                   Your Server (Polity Backend)               │
│                                                              │
│  1. Notification Created in InstantDB                        │
│     (createNotification helper)                              │
│                                                              │
│  2. Push API Triggered (/api/push/send)                     │
│     • Query pushSubscriptions from InstantDB                 │
│     • Send push via web-push library                        │
│     • Use VAPID keys for authentication                     │
│     • Handle failed subscriptions                           │
└─────────────────────────────────────────────────────────────┘
```

## Debugging

### 1. Keys prüfen

```bash
curl http://localhost:3000/api/push/send
```

Response sollte enthalten:

```json
{
  "status": "ok",
  "pushNotificationsEnabled": true,
  "vapidPublicKey": "BJA1BnRmaQSqdb_n5rxW..."
}
```

### 2. Service Worker Status prüfen

In Chrome DevTools:

1. Application Tab → Service Workers
2. Sollte "custom-sw.js" zeigen als "activated and running"

### 3. Push-Subscription testen

```javascript
// In Browser Console
navigator.serviceWorker.ready
  .then(reg => {
    return reg.pushManager.getSubscription();
  })
  .then(sub => {
    console.log('Subscription:', sub);
    if (sub) {
      console.log('Endpoint:', sub.endpoint);
    }
  });
```

### 4. Logs überwachen

**Service Worker Logs:**

- Chrome: DevTools → Console → Filter auf "Service Worker"
- Zeigt: Push Events, Notification clicks

**Server Logs:**

- Vercel: Dashboard → Functions → Logs
- Local: Terminal wo `npm run dev` läuft

## Troubleshooting

### Problem: "Push notifications not configured"

**Lösung:**

1. Prüfen Sie `.env` Datei
2. Stellen Sie sicher, dass Keys korrekt kopiert wurden
3. Restart development server: `npm run dev`

### Problem: Subscription wird nicht gespeichert

**Mögliche Ursachen:**

1. InstantDB Schema nicht gepusht
2. Permissions in `instant.perms.ts` falsch
3. User nicht authentifiziert

**Lösung:**

1. Check InstantDB Console → Data → pushSubscriptions table sollte existieren
2. Login Status in App prüfen

### Problem: Keine Benachrichtigungen auf iOS

**Lösung:**

1. Prüfen Sie iOS Version (mindestens 16.4)
2. PWA muss zum Home Screen hinzugefügt sein
3. PWA muss vom Home Screen geöffnet werden (nicht Safari)
4. Permissions müssen in PWA granted werden

### Problem: Service Worker lädt nicht

**Lösung:**

1. Build prüfen: `npm run build`
2. `/public/custom-sw.js` sollte existieren
3. `next.config.mjs` sollte `sw: 'custom-sw.js'` enthalten

## Kosten & Limits

### KEINE Kosten für

- ✅ VAPID Keys (kostenlos generiert)
- ✅ Browser Push Services (Google, Mozilla, Apple) - kostenlos
- ✅ Vercel Hosting (im Free Plan enthalten)
- ✅ InstantDB (abhängig von Ihrem Plan)

### Limits beachten

- **Browser Push Services**: Keine offiziellen Limits, aber Fair Use Policy
- **InstantDB**: Je nach Plan unterschiedliche Datenlimits
- **Vercel Functions**: Free Plan hat Function-Ausführungslimits

## Weitere Ressourcen

- [Web Push API Dokumentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
- [VAPID Spec](https://datatracker.ietf.org/doc/html/rfc8292)
- [iOS Web Push Support](https://webkit.org/blog/12945/meet-web-push/)
