// =========================================
// LINKVAULT SERVICE WORKER
// =========================================

const CACHE_NAME = "linkvault-v3";

const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./firebase.js",
    "./manifest.json",
    "./icon.png"
];


// =========================================
// INSTALL
// =========================================

self.addEventListener("install", event => {

    console.log("🔧 LinkVault Service Worker Installing...");

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                console.log("📦 Caching LinkVault assets");

                return cache.addAll(ASSETS);

            })
            .then(() => {

                console.log("✅ LinkVault Service Worker Installed");

                return self.skipWaiting();

            })

    );

});


// =========================================
// ACTIVATE
// =========================================

self.addEventListener("activate", event => {

    console.log("🚀 LinkVault Service Worker Activated");

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(cacheName => {

                            return cacheName !== CACHE_NAME;

                        })
                        .map(cacheName => {

                            console.log(
                                "🗑 Removing old cache:",
                                cacheName
                            );

                            return caches.delete(cacheName);

                        })

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


// =========================================
// FETCH
// =========================================

self.addEventListener("fetch", event => {

    const request = event.request;


    // Only handle GET requests
    if (request.method !== "GET") {

        return;

    }


    event.respondWith(

        fetch(request)

            .then(response => {

                // Save successful response in cache
                if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ) {

                    const responseClone =
                        response.clone();


                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                request,
                                responseClone
                            );

                        });

                }


                return response;

            })

            .catch(() => {

                // If internet unavailable,
                // use cached version

                return caches.match(request);

            })

    );

});