// Service worker mínimo da casca da Gaveta de Links.
// Guarda só os arquivos da casca (não o sistema, que vem do Apps Script e sempre busca dados atualizados).
// Ao mudar algum arquivo da casca, troque a versão abaixo para os celulares baixarem a nova.
const CACHE = 'gaveta-casca-v1';
const ARQUIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(nome => nome !== CACHE).map(nome => caches.delete(nome))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro (pega atualizações), cache como reserva se estiver sem internet.
// Pedidos para outros sites (Apps Script, Google) passam direto, sem interferência.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then(resp => {
        const copia = resp.clone();
        caches.open(CACHE).then(cache => cache.put(req, copia));
        return resp;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
