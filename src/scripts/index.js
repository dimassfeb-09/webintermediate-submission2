import "../styles/styles.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import router from "./routes/router";
import "../scripts/components/load-indicator.js";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export function isServiceWorkerAvailable() {
  return "serviceWorker" in navigator;
}

export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { type: "module" })
        .then((reg) => {
          console.log("Service Worker registered:", reg);
        })
        .catch((err) => {
          console.log("Service Worker registration failed:", err);
        });
    });
  }
}

let loadingIndicator;

function showLoading() {
  loadingIndicator?.show?.();
}

function hideLoading() {
  loadingIndicator?.hide?.();
}

document.addEventListener("DOMContentLoaded", async () => {
  loadingIndicator = document.getElementById("loading");
  router.init();
  const token = localStorage.getItem("token");
  console.log("Token di index.js:", token);

  const reg = await registerServiceWorker();
  console.log("SW register result:", reg);
});

export { showLoading, hideLoading };
