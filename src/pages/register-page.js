import AuthModel from "../models/authmodel";
import { showLoading, hideLoading } from "../scripts/index.js";

const registerpage = {
  async render() {
    return `
          <section class="form">
           <h2>Register</h2>
           <form id="registerform">
              <div>
                  <label for="name">Nama: </label>
                  <input type="text" id="name" name="name" required>
              </div>
              <div>
                  <label for="email">Email: </label>
                  <input type="email" id="email" name="email" required>
              </div>
              <div>
                  <label for="password">Password: </label>
                  <input type="password" id="password" name="password" required>
              </div>
              <button type="submit">Daftar</button>
              </form>
              <p id="message"></p>
              <p>Sudah punya akun? <a href="#/login">Login</a></p>
          </section>
          `;
  },

  async afterRender() {
    const form = document.getElementById("registerform");
    const message = document.getElementById("message");

    const auth = new AuthModel();
    const pushBtn = document.getElementById("push-toggle-btn");
    if (pushBtn) pushBtn.remove();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;

      try {
        showLoading();
        const result = await auth.register(name, email, password);

        message.textContent = "Registration successful!";
        message.style.color = "green";

        setTimeout(() => {
          window.location.href = "#/login";
        }, 50);
      } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";
      } finally {
        hideLoading();
      }
    });
  },
};

export default registerpage;
