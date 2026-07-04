initializeHeader();

function initializeHeader() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectHeader, { once: true });
    return;
  }

  injectHeader();
}

function injectHeader() {
  const headerContainer = document.getElementById("header");

  if (!headerContainer) {
    return;
  }

  fetch("header.html")
    .then((res) => res.text())
    .then((data) => {
      headerContainer.innerHTML = data;

      setActiveNavLink();
      setupMobileNavigation();
    })
    .catch((error) => {
      console.error("Unable to load header", error);
    });
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");

    if (href === currentPage) {
      link.classList.add("active");
    }
  });
} 

function setupMobileNavigation() {
  const headerElement = document.querySelector("header");
  const toggleButton = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!headerElement || !toggleButton || !navLinks) {
    return;
  }

  const closeMenu = () => {
    navLinks.classList.remove("open");
    toggleButton.setAttribute("aria-expanded", "false");
  };

  toggleButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    toggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 900 || !navLinks.classList.contains("open")) {
      return;
    }

    if (!headerElement.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (window.innerWidth > 900 || !navLinks.classList.contains("open")) {
      return;
    }

    if (event.key === "Escape") {
      closeMenu();
      toggleButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });
}