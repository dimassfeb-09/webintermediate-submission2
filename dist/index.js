import Router from "./utils/router.js";
import { subscribeToPush } from "./utils/push.js";

document.addEventListener("DOMContentLoaded", () => {
  Router.init();
});

if ("serviceWorker" in navigator && "PushManager" in window) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("sw.js");
      console.log("Service Worker registered:", reg);

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await subscribeToPush();
        console.log("Notification permission granted.");
      }
    } catch (err) {
      console.error("Service Worker registration or permission failed:", err);
    }
  });
}
