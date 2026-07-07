const CACHE = 'ai-toolkit-v1'
const URLS = [
  '/momiqi/',
  '/momiqi/index.html',
  '/momiqi/manifest.json',
]

self.addEventListener('install', (e) => {
  (e as ExtendableEvent).waitUntil(
    caches.open(CACHE).then(c => c.addAll(URLS))
  )
})

self.addEventListener('fetch', (e) => {
  const req = e as FetchEvent
  req.respondWith(
    caches.match(req.request).then(r => r || fetch(req.request))
  )
})
