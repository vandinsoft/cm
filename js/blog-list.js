const POSTS_PER_PAGE = 12;

let allPosts = [];
let filteredPosts = [];

let currentPage = 1;
let selectedTag = "All";

const blogGrid = document.getElementById("blogGrid");
const tagContainer = document.getElementById("tagContainer");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");

initialize();

async function initialize() {
  try {
    const response = await fetch("blog-index.json");

    if (!response.ok) {
      throw new Error("Unable to load blog index");
    }

    allPosts = await response.json();

    // Newest first

    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredPosts = [...allPosts];

    renderTags();
    renderPage(1);

    searchInput.addEventListener("input", applyFilters);
  } catch (error) {
    blogGrid.innerHTML = `
            <div class="empty-state">
                Unable to load blog posts.
            </div>
        `;

    console.error(error);
  }
}

function renderTags() {
  const tagSet = new Set();

  allPosts.forEach((post) => {
    (post.tags || []).forEach((tag) => {
      tagSet.add(tag);
    });
  });

  const tags = ["All", ...Array.from(tagSet).sort()];

  tagContainer.innerHTML = tags
    .map(
      (tag) => `
        <button
            class="tag ${tag === selectedTag ? "active" : ""}"
            data-tag="${escapeHtml(tag)}">

            ${escapeHtml(tag)}

        </button>
    `,
    )
    .join("");

  document.querySelectorAll(".tag").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTag = button.dataset.tag;

      currentPage = 1;

      renderTags();

      applyFilters();
    });
  });
}

function applyFilters() {
  const searchText = searchInput.value.trim().toLowerCase();

  filteredPosts = allPosts.filter((post) => {
    const tagMatch =
      selectedTag === "All" || (post.tags || []).includes(selectedTag);

    const text = [post.title, post.excerpt, ...(post.tags || [])]
      .join(" ")
      .toLowerCase();

    const searchMatch = text.includes(searchText);

    return tagMatch && searchMatch;
  });

  renderPage(1);
}

function renderPage(pageNumber) {
  currentPage = pageNumber;

  const start = (pageNumber - 1) * POSTS_PER_PAGE;

  const end = start + POSTS_PER_PAGE;

  const posts = filteredPosts.slice(start, end);

  if (posts.length === 0) {
    blogGrid.innerHTML = `
            <div class="empty-state">
                No matching articles found.
            </div>
        `;

    pagination.innerHTML = "";

    return;
  }

  blogGrid.innerHTML = posts.map(renderCard).join("");

  document.querySelectorAll(".clickable-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        return;
      }

      window.location.href = card.dataset.url;
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        window.location.href = card.dataset.url;
      }
    });
  });

  renderPagination();
}

function renderCard(post) {
  const tags = (post.tags || [])
    .map((tag) => `<span class="blog-tag">${escapeHtml(tag)}</span>`)
    .join("");

  return `
<article
    class="blog-card clickable-card"
    tabindex="0"
    data-url="blog-post.html?post=${encodeURIComponent(post.file)}">
        <h3>
            ${escapeHtml(post.title)}
        </h3>

        <p>
            ${escapeHtml(post.excerpt || "")}
        </p>

        <div class="blog-meta">
            ${formatDate(post.date)}
            •
            ${estimateReadingTime(post.wordCount)}
        </div>

        <div class="blog-tags">
            ${tags}
        </div>

        <a
            class="blog-link"
            href="blog-post.html?post=${encodeURIComponent(post.file)}">

            Read Article →

        </a>

    </article>
`;
}

function renderPagination() {
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  if (totalPages <= 1) {
    pagination.innerHTML = "";

    return;
  }

  let html = "";

  if (currentPage > 1) {
    html += `
            <button
                class="page-btn"
                data-page="${currentPage - 1}">

                Previous

            </button>
        `;
  }

  for (let page = 1; page <= totalPages; page++) {
    html += `
            <button
                class="page-btn ${page === currentPage ? "active" : ""}"
                data-page="${page}">

                ${page}

            </button>
        `;
  }

  if (currentPage < totalPages) {
    html += `
            <button
                class="page-btn"
                data-page="${currentPage + 1}">

                Next

            </button>
        `;
  }

  pagination.innerHTML = html;

  pagination.querySelectorAll(".page-btn").forEach((button) => {
    button.addEventListener("click", () => {
      renderPage(parseInt(button.dataset.page));

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  });
}

function estimateReadingTime(wordCount) {
  if (!wordCount) {
    return "1 min read";
  }

  const minutes = Math.max(1, Math.ceil(wordCount / 200));

  return `${minutes} min read`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function escapeHtml(text) {
  if (!text) {
    return "";
  }

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
