import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      const subscription =
        await self.registration.pushManager.getSubscription();
      if (!subscription || Notification.permission !== "granted") return;

      let data = {
        title: "Notifikasi Baru",
        body: "Anda memiliki notifikasi baru.",
        url: "/",
      };

      if (event.data) {
        try {
          data = event.data.json();
        } catch (err) {
          data.body = event.data.text();
        }
      }

      const options = {
        body: data.body,
        data: data.url,
      };

      await self.registration.showNotification(data.title, options);
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === event.notification.data && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data);
        }
      })
  );
});
