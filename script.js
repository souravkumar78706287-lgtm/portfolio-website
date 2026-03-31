const yearElement = document.getElementById("year");
const messageElement = document.getElementById("message");
const introButton = document.getElementById("intro-button");
const projectGrid = document.getElementById("project-grid");
const themeToggle = document.getElementById("theme-toggle");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const adminForm = document.getElementById("admin-form");
const adminStatus = document.getElementById("admin-status");
const adminLoginBox = document.getElementById("admin-login-box");
const responsesBox = document.getElementById("responses-box");
const responsesList = document.getElementById("responses-list");
const adminLogout = document.getElementById("admin-logout");

const RESPONSE_STORAGE_KEY = "portfolioContactResponses";
const THEME_STORAGE_KEY = "portfolioTheme";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

if (introButton && messageElement) {
  introButton.addEventListener("click", () => {
    messageElement.textContent = "Thanks for visiting my portfolio. Let's build something awesome!";
  });
}

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.body.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    });
  }
}

function renderProjects(projects) {
  if (!projectGrid) return;

  if (!projects.length) {
    projectGrid.innerHTML = "<p class='loading'>No projects found.</p>";
    return;
  }

  projectGrid.innerHTML = projects
    .map((project) => {
      const techHtml = (project.technologies || [])
        .map((tech) => `<span class="chip">${tech}</span>`)
        .join("");
      const links = [];
      if (project.liveLink) {
        links.push(
          `<a class="card-link" href="${project.liveLink}" target="_blank" rel="noopener noreferrer">Live Demo</a>`
        );
      }
      if (project.githubLink) {
        links.push(
          `<a class="card-link" href="${project.githubLink}" target="_blank" rel="noopener noreferrer">GitHub</a>`
        );
      }
      if (!links.length && project.link) {
        links.push(
          `<a class="card-link" href="${project.link}" target="_blank" rel="noopener noreferrer">View Project</a>`
        );
      }

      return `
        <article class="project-card">
          <h4>${project.title}</h4>
          <p>${project.description}</p>
          <div class="chip-row">${techHtml}</div>
          <div class="project-links">${links.join("")}</div>
        </article>
      `;
    })
    .join("");
}

async function loadProjects() {
  if (!projectGrid) return;

  try {
    const response = await fetch("projects.json");
    if (!response.ok) {
      throw new Error("Unable to load projects.json");
    }
    const projects = await response.json();
    renderProjects(projects);
  } catch (error) {
    projectGrid.innerHTML = "<p class='loading'>Could not load projects. Add them manually in projects.json.</p>";
  }
}

function readResponses() {
  const raw = localStorage.getItem(RESPONSE_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveResponses(responses) {
  localStorage.setItem(RESPONSE_STORAGE_KEY, JSON.stringify(responses));
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}

function renderResponses() {
  if (!responsesList) return;
  const responses = readResponses();

  if (!responses.length) {
    responsesList.innerHTML = "<p class='loading'>No responses submitted yet.</p>";
    return;
  }

  const newestFirst = [...responses].reverse();
  responsesList.innerHTML = newestFirst
    .map(
      (item) => `
      <article class="response-card">
        <p><strong>Name:</strong> ${item.name}</p>
        <p><strong>Email:</strong> ${item.email}</p>
        <p><strong>Message:</strong> ${item.message}</p>
        <p><strong>Time:</strong> ${formatTime(item.timestamp)}</p>
      </article>
    `
    )
    .join("");
}

function showAdminResponses() {
  if (adminLoginBox) adminLoginBox.classList.add("hidden");
  if (responsesBox) responsesBox.classList.remove("hidden");
  renderResponses();
}

function showAdminLogin() {
  if (responsesBox) responsesBox.classList.add("hidden");
  if (adminLoginBox) adminLoginBox.classList.remove("hidden");
}

function initContactForm() {
  if (!contactForm) return;
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      if (formStatus) formStatus.textContent = "Please fill all fields.";
      return;
    }

    const responses = readResponses();
    responses.push({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
    });
    saveResponses(responses);

    if (formStatus) formStatus.textContent = "Message saved successfully.";
    contactForm.reset();
  });
}

function initAdmin() {
  if (adminForm) {
    adminForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const usernameInput = document.getElementById("admin-username");
      const passwordInput = document.getElementById("admin-password");
      const username = usernameInput ? usernameInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        if (adminStatus) adminStatus.textContent = "";
        showAdminResponses();
      } else if (adminStatus) {
        adminStatus.textContent = "Invalid credentials.";
      }
    });
  }

  if (adminLogout) {
    adminLogout.addEventListener("click", () => {
      showAdminLogin();
    });
  }
}

initTheme();
initContactForm();
initAdmin();
loadProjects();
