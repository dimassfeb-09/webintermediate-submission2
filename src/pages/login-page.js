import AuthModel from "../models/authmodel";
import { showLoading, hideLoading } from "../scripts/index.js";

const loginpage = {
  async render() {
    return `
      <section class="form">
        <h2>Login</h2>
        <form id="loginform">
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Login</button>
        </form>
        <p id="message"></p>
        <p>Belum punya akun? <a href="#/register">Daftar</a></p>
      </section>
    `;
  },

  async afterRender() {
    const form = document.getElementById("loginform");
    const message = document.getElementById("message");

    const auth = new AuthModel();
    const pushBtn = document.getElementById("push-toggle-btn");
    if (pushBtn) pushBtn.remove();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;

      try {
        showLoading();
        const response = await auth.login(email, password);
        const { token, userId, name } = response.loginResult;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("name", name);

        window.location.hash = "/";
      } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";
      } finally {
        hideLoading();
      }
    });
  },
};

export default loginpage;
