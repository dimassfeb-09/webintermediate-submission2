import StoryModel from "../../models/StoryModel.js";
import { initMap, getSelectedLocation } from "../../utils/map.js";
import { saveStoriesToDB } from "../../utils/idb.js";

const AddStoryPage = {
  async render() {
    return `
      <section class="addStoryPageSection page-enter">
        <h2>Tambah Cerita Baru</h2>
        <form id="storyForm">
          <label for="description">Deskripsi:</label>
          <textarea id="description" required></textarea>

          <label>Ambil Gambar:</label>
          <video id="cameraPreview" autoplay style="display: none;"></video>
          <canvas id="canvas" style="display: none;"></canvas>
          <img id="photoPreview" alt="Pratinjau Foto" style="display: none; max-width: 100%;">

          <button type="button" id="startCamera">Buka Kamera</button>
          <button type="button" id="takePhoto" style="display: none;">Ambil Foto</button>
          <button type="button" id="stopCamera" style="display: none;">Matikan Kamera</button>

          <label for="image">Atau Pilih Gambar:</label>
          <input id="image" type="file" accept="image/*">

          <div id="map" style="height: 300px;"></div>
          <label for="latInput">Latitude:</label>
          <input id="latInput" type="text" readonly>

          <label for="lngInput">Longitude:</label>
          <input id="lngInput" type="text" readonly>


          <button type="submit">Kirim</button>
        </form>
      </section>
    `;
  },

  async afterRender() {
    initMap();

    const section = document.querySelector(".addStoryPageSection");
    if (section) {
      requestAnimationFrame(() => {
        section.classList.add("page-enter-active");
      });

      setTimeout(() => {
        section.classList.remove("page-enter");
        section.classList.remove("page-enter-active");
      }, 600);
    }

    const video = document.getElementById("cameraPreview");
    const canvas = document.getElementById("canvas");
    const photoPreview = document.getElementById("photoPreview");
    const startCameraBtn = document.getElementById("startCamera");
    const takePhotoBtn = document.getElementById("takePhoto");
    const stopCameraBtn = document.getElementById("stopCamera");
    const imageInput = document.getElementById("image");

    let stream = null;
    let capturedImage = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            resolve();
          };
        });

        video.play();
        video.style.display = "block";
        takePhotoBtn.style.display = "block";
        stopCameraBtn.style.display = "block";
        startCameraBtn.style.display = "none";
        imageInput.style.display = "none";
      } catch (error) {
        console.error("Gagal mengakses kamera:", error);
        alert(
          "Tidak dapat mengakses kamera. Periksa izin atau gunakan browser lain."
        );
      }
    }

    function takePhoto() {
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert("Kamera belum siap. Coba beberapa detik lagi.");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          alert("Gagal mengambil gambar. Coba lagi.");
          return;
        }

        capturedImage = blob;
        const imageUrl = URL.createObjectURL(blob);

        photoPreview.src = imageUrl;
        photoPreview.style.display = "block";
        photoPreview.classList.add("show");
      }, "image/png");

      stopCamera();
    }

    function stopCamera() {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        video.style.display = "none";
        takePhotoBtn.style.display = "none";
        stopCameraBtn.style.display = "none";
        startCameraBtn.style.display = "block";
        imageInput.style.display = "block";
      }
    }

    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        photoPreview.src = imageUrl;
        photoPreview.style.display = "block";
        capturedImage = file;
      }
    });

    const saveStoryOffline = async (story) => {
      await saveStoriesToDB(story);
      console.log("Cerita disimpan secara offline!");
    };

    document
      .getElementById("storyForm")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const location = getSelectedLocation();
        if (!location || !location.lat || !location.lng) {
          alert("Silakan pilih lokasi di peta terlebih dahulu.");
          return;
        }

        if (!capturedImage) {
          alert("Silakan ambil atau pilih gambar terlebih dahulu.");
          return;
        }

        const formData = new FormData();
        formData.append(
          "description",
          document.getElementById("description").value
        );
        formData.append("photo", capturedImage, "photo.png");
        formData.append("lat", location.lat);
        formData.append("lon", location.lng);

        try {
          const token = localStorage.getItem("token");
          const model = new StoryModel("https://story-api.dicoding.dev/v1");
          await model.addStory(formData, token);

          alert("Cerita berhasil ditambahkan!");
          window.location.hash = "#/";
        } catch (error) {
          const offlineStory = {
            description: document.getElementById("description").value,
            image: capturedImage,
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date().toISOString(),
          };

          await saveStoryOffline(offlineStory);

          alert("Cerita gagal dikirim, disimpan secara offline.");
        }
      });

    startCameraBtn.addEventListener("click", startCamera);
    takePhotoBtn.addEventListener("click", takePhoto);
    stopCameraBtn.addEventListener("click", stopCamera);
  },
};

export default AddStoryPage;
