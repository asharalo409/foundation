const VERSION = 'v1'
const SHELL = 'shell-' + VERSION
const IMG = 'img-' + VERSION

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icon.svg']))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== SHELL && k !== IMG).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone()
          caches.open(SHELL).then(c => c.put('./index.html', copy))
          return res
        })
        .catch(() => caches.match('./index.html'))
    )
    return
  }

  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then(hit =>
        hit ||
        fetch(req).then(res => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(SHELL).then(c => c.put(req, copy))
          }
          return res
        })
      )
    )
    return
  }

  if (url.pathname.includes('/storage/v1/object/public/')) {
    e.respondWith(
      caches.match(req).then(hit =>
        hit ||
        fetch(req).then(res => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(IMG).then(c => c.put(req, copy))
          }
          return res
        })
      )
    )
  }
})
