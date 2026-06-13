fetch("header.html")
  .then((res) => res.text())
  .then((data) => {
    const headerContainer = document.getElementById("header");
    headerContainer.innerHTML = data;

    // run AFTER header is injected
    setActiveNavLink();
  });

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");

    if (href === currentPage) {
      link.classList.add("active");
    }
  });
} 