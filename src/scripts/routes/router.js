import registerpage from "../../pages/register-page";
import loginpage from "../../pages/login-page";
import homePage from "../../pages/home-page";
import addstorypage from "../../pages/add-story-page";

const routes = {
  "/": homePage,
  "/register": registerpage,
  "/login": loginpage,
  "/add-story": addstorypage,
};

const router = {
  init() {
    this.loadPage = this.loadPage.bind(this);
    window.addEventListener("hashchange", this.loadPage);

    const logoutLink = document.getElementById("logout");
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.hash = "/login";
        this.updateNav();
      });
    }
    this.loadPage();
    this.updateNav();
  },

  async loadPage() {
    const path = window.location.hash.slice(1) || "/";
    const token = localStorage.getItem("token");

    if (token && (path === "/login" || path === "/register")) {
      window.location.hash = "/";
      return;
    }

    if (!token && path !== "/login" && path !== "/register") {
      window.location.hash = "/login";
      return;
    }

    const page = routes[path];
    const main = document.getElementById("main-content");

    if (!page || !main) return;

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        main.innerHTML = await page.render();
        await page.afterRender();
        this.updateNav();
      });
    } else {
      main.innerHTML = await page.render();
      await page.afterRender();
      this.updateNav();
    }
  },

  updateNav() {
    const token = localStorage.getItem("token");

    const register = document.getElementById("regist-page");
    const login = document.getElementById("login-page");
    const home = document.getElementById("home-page");
    const add = document.getElementById("add-page");
    const logout = document.getElementById("logout");

    if (register) register.style.display = token ? "none" : "inline-block";
    if (login) login.style.display = token ? "none" : "inline-block";
    if (home) home.style.display = token ? "inline-block" : "none";
    if (add) add.style.display = token ? "inline-block" : "none";
    if (logout) logout.style.display = token ? "inline-block" : "none";
  },
};

export default router;
