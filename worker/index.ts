/// <reference lib="webworker" />
// Custom worker — injected by next-pwa into Workbox SW bundle.

const SYNC_TAG = "focus-task-sync";

// Persist storage on activate
addEventListener("activate", (event) => {
  (event as ExtendableEvent).waitUntil(
    (async () => {
      try {
        if ("storage" in navigator && "persist" in navigator.storage) {
          await navigator.storage.persist();
        }
      } catch { /* ignore */ }
    })()
  );
});

// Background sync — fires when connectivity resumes (Chrome/Android)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
addEventListener("sync", (event: any) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(
      self.clients
        .matchAll({ includeUncontrolled: true, type: "window" })
        .then((clients: ReadonlyArray<Client>) =>
          Promise.all(clients.map((c) => c.postMessage({ type: "BACKGROUND_SYNC" })))
        )
    );
  }
});

// Push notifications (future)
addEventListener("push", (event) => {
  const pushEvent = event as PushEvent;
  if (!pushEvent.data) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = {};
  try { data = pushEvent.data.json(); } catch { /* ignore */ }
  pushEvent.waitUntil(
    self.registration.showNotification(data.title ?? "✦ focus", {
      body: data.body ?? "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      tag: "focus-notification",
      data: { url: data.url ?? "/app/today" },
    })
  );
});

// Notification click — focus or open app
addEventListener("notificationclick", (event) => {
  const ncEvent = event as NotificationEvent;
  ncEvent.notification.close();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const url: string = (ncEvent.notification.data as any)?.url ?? "/app/today";
  ncEvent.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients: ReadonlyArray<WindowClient>) => {
        const focused = clients.find((c) => c.url.includes(url));
        return focused ? focused.focus() : self.clients.openWindow(url);
      })
  );
});
