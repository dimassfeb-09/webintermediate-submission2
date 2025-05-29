import { BASE_URL, VAPID_PUBLIC_KEY } from "../utils/config.js";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    return await navigator.serviceWorker.register("/sw.js");
  }
  throw new Error("Service Worker not supported");
}

export async function subscribeUser(swReg, token) {
  try {
    let subscription = await swReg.pushManager.getSubscription();

    if (!subscription) {
      subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const { endpoint, keys } = subscription.toJSON();

      await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint, keys }),
      });

      console.log(
        "✅ Subscribed to push notifications:",
        subscription.endpoint
      );
    } else {
      console.log("Already subscribed:", subscription.endpoint);
    }
  } catch (error) {
    console.error("❌ Failed to subscribe user:", error);
  }
}

export async function unsubscribeUser(swReg, token) {
  try {
    const subscription = await swReg.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      console.log("🔕 Unsubscribing from:", endpoint);

      const unsubscribed = await subscription.unsubscribe();
      console.log("Unsubscribed locally:", unsubscribed);

      const res = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint }),
      });

      const data = await res.json();
      console.log("✅ Unsubscribed from server:", data.message);
    }
  } catch (error) {
    console.error("❌ Failed to unsubscribe:", error);
  }
}

export async function isSubscribed(swReg) {
  const subscription = await swReg.pushManager.getSubscription();
  return !!subscription;
}
