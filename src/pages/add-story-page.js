import StoryModel from "../models/storymodel";
import { BASE_URL } from "../utils/config";
import { initMap, getSelectedLocation } from "../utils/map";
import { showLoading, hideLoading } from "../scripts/index.js";

const addStorypage = {
  async render() {
    return `
      <section class="addstorypage page-enter">
        <form id="storyform">
          <label for="desc">Deskripsi:</label>
          <textarea id="desc" required></textarea>

          <div class="camera-section">
            <label>Ambil Foto: </label>
            <video id="cameraPreview" autoplay style="width: 100%; max-height: 300px; display: none;"></video>
            <canvas id="canvas" style="display: none;"></canvas>
            <img id="cameraPreviewImg" alt="Preview Kamera" style="display: none; max-width: 100%">

            <button type="button" id="startCamera">📷 Buka Kamera</button>

            <div id="cameraButtons" style="display: none; margin-top: 10px; gap: 10px;">
              <button type="button" id="takePhoto">Ambil Foto</button>
              <button type="button" id="stopCamera">Tutup Kamera</button>
            </div>
          </div>

          <label for="image" id="imageLabel">Pilih gambar:</label>
          <img id="uploadPreviewImg" alt="Preview Upload" style="display: none; max-width: 100%">
          <input id="image" type="file" accept="image/*">

          <div id="map" style="height:300px;"></div>

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

    const section = document.querySelector(".addstorypage");
    if (section) {
      requestAnimationFrame(() => {
        section.classList.add("page-enter-active");
      });

      setTimeout(() => {
        section.classList.remove("page-enter");
        section.classList.remove("page-enter-active");
      }, 500);
    }

    const video = document.getElementById("cameraPreview");
    const canvas = document.getElementById("canvas");
    const imgPreview = document.getElementById("cameraPreviewImg");
    const startCameraBtn = document.getElementById("startCamera");
    const takePhotoBtn = document.getElementById("takePhoto");
    const stopCameraBtn = document.getElementById("stopCamera");
    const imageInput = document.getElementById("image");

    let stream = null;
    let capturedImage = null;
    let cameraImage = null;
    let uploadImage = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        await new Promise((resolve) => {
          video.onloadeddata = () => {
            resolve();
          };
        });

        video.play();
        video.style.display = "block";
        startCameraBtn.style.display = "none";
        imageInput.disabled = true;
        document.getElementById("cameraButtons").style.display = "flex";
      } catch (error) {
        console.error("Cannot access camera:", error);
        alert("Tidak dapat mengakses kamera, periksa izin perangkat Anda.");
      }
    }

    function takePhoto() {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          alert("Gagal mengambil foto. Coba lagi.");
          return;
        }

        cameraImage = blob;
        uploadImage = null;
        const imageUrl = URL.createObjectURL(blob);
        imgPreview.src = imageUrl;
        imgPreview.style.display = "block";
      }, "image/png");

      stopCamera();
    }

    function stopCamera() {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
      video.style.display = "none";
      startCameraBtn.style.display = "block";
      imageInput.disabled = false;
      document.getElementById("cameraButtons").style.display = "none";
    }

    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (file) {
        uploadImage = file;
        cameraImage = null;

        const imageUrl = URL.createObjectURL(file);
        document.getElementById("uploadPreviewImg").src = imageUrl;
        document.getElementById("uploadPreviewImg").style.display = "block";
        document.getElementById("cameraPreviewImg").style.display = "none";
      }
    });

    document
      .getElementById("storyform")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const location = getSelectedLocation();
        if (!location || !location.lat || !location.lng) {
          alert("Pilih lokasi terlebih dahulu.");
          return;
        }

        let imageToUpload = cameraImage || uploadImage;

        if (!imageToUpload) {
          alert("Ambil foto atau pilih gambar terlebih dahulu.");
          return;
        }

        const token = localStorage.getItem("token");
        const storyModel = new StoryModel(BASE_URL);

        const formData = new FormData();
        formData.append("description", document.getElementById("desc").value);
        formData.append("photo", imageToUpload, "image.png");
        formData.append("lat", location.lat);
        formData.append("lon", location.lng);

        try {
          showLoading();
          const result = await storyModel.addStory(formData, token);
          alert("Story berhasil ditambahkan!");
          window.location.hash = "/";
        } catch (error) {
          alert("Gagal menambahkan Story.");
          console.error("Error when adding story:", error);
        } finally {
          hideLoading();
        }
      });

    startCameraBtn.addEventListener("click", startCamera);
    takePhotoBtn.addEventListener("click", takePhoto);
    stopCameraBtn.addEventListener("click", stopCamera);
  },
};

export default addStorypage;
