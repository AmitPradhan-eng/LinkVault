const cacheName = "linkvault-v2";

const assets = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];


// Install Service Worker

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(cacheName)
        .then(cache => {

            return cache.addAll(assets);

        })

    );

});


// Load From Cache

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
        .then(response => {

            return response || fetch(event.request);

        })

    );

});

self.addEventListener("install", event => {
    console.log("LinkVault installed");
});

self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
    );
});