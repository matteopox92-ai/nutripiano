// Service worker di NutriPiano: riceve le notifiche push e apre l'app quando le tocchi.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { titolo: 'NutriPiano', testo: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.titolo || 'NutriPiano', {
    body: d.testo || '',
    icon: 'icona.svg',
    badge: 'icona.svg',
    tag: 'nutripiano-msg',
    renotify: true,
    data: { link: d.link || '' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const link = (e.notification.data && e.notification.data.link) || self.registration.scope;
  e.waitUntil((async () => {
    const finestre = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const f of finestre) {
      if (f.url.split('#')[0].startsWith(self.registration.scope)) {
        await f.focus();
        if (link && f.url !== link) f.navigate(link).catch(() => {});
        return;
      }
    }
    await self.clients.openWindow(link);
  })());
});
