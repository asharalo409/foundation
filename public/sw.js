const SHELL = 'shell-v4'
const IMG = 'img-v1'
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png']

self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(SHELL).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {}))))
  )
})

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => k !== SHELL && k !== IMG).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  if (url.pathname.includes('/storage/v1/object/public/')) {
    e.respondWith((async () => {
      const c = await caches.open(IMG)
      const hit = await c.match(req)
      if (hit) return hit
      try {
        const r = await fetch(req)
        if (r.status === 200 || r.type === 'opaque') c.put(req, r.clone())
        return r
      } catch {
        return hit || Response.error()
      }
    })())
    return
  }

  if (url.origin !== self.location.origin) return
  if (url.pathname.includes('/hafezi/') && !url.pathname.endsWith('.json')) return

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(r => {
          const copy = r.clone()
          caches.open(SHELL).then(c => c.put('./index.html', copy))
          return r
        })
        .catch(async () => (await caches.match('./index.html')) || (await caches.match('./')) || Response.error())
    )
    return
  }

  e.respondWith((async () => {
    const c = await caches.open(SHELL)
    const hit = await c.match(req)
    const net = fetch(req)
      .then(r => { if (r.status === 200) c.put(req, r.clone()); return r })
      .catch(() => null)
    return hit || (await net) || Response.error()
  })())
})

self.addEventListener('push', e => {
  let d = {}
  try { d = e.data ? e.data.json() : {} } catch { d = { title: 'নতুন বার্তা', body: e.data ? e.data.text() : '' } }
  e.waitUntil(
    self.registration.showNotification(d.title || 'নতুন বার্তা', {
      body: d.body || '',
      icon: d.icon || './icon-192.png',
      tag: d.tag || 'push',
      data: { tab: d.tab || 'home' },
      vibrate: d.urgent ? [200, 100, 200, 100, 300] : [120],
      requireInteraction: !!d.urgent,
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const tab = (e.notification.data && e.notification.data.tab) || 'home'
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) {
          c.postMessage({ type: 'open-tab', tab })
          return c.focus()
        }
      }
      return self.clients.openWindow('./')
    })
  )
})
