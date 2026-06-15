const articleTitle = document.getElementById("articleTitle");

const articleMeta = document.getElementById("articleMeta");

const articleContent = document.getElementById("articleContent");

initialize();

async function initialize() {
  const params = new URLSearchParams(window.location.search);

  const file = params.get("post");

  if (!file) {
    showError("No article specified.");

    return;
  }

  const validFilePattern = /^[a-zA-Z0-9._-]+\.md$/;

  if (!validFilePattern.test(file)) {
    showError("Invalid article name.");

    return;
  }
  try {
    const response = await fetch(`blob/main/blogs/${file}`);

    if (!response.ok) {
      throw new Error("Unable to load article");
    }

    const markdown = await response.text();

    const parsed = parseFrontMatter(markdown);

    renderArticle(parsed);
  } catch (error) {
    console.error(error);

    showError("Unable to load article.");
  }
}

function renderArticle(article) {
  document.title = article.title || "Blog Article";

  articleTitle.textContent = article.title || "Untitled";

  articleMeta.textContent = [
    formatDate(article.date),
    estimateReadingTime(article.wordCount),
  ]
    .filter(Boolean)
    .join(" • ");

  articleContent.innerHTML = marked.parse(article.content || "");
}

function parseFrontMatter(markdown) {
  const result = {
    title: "",
    date: "",
    tags: [],
    excerpt: "",
    content: markdown,
    wordCount: 0,
  };

  if (!markdown.startsWith("---")) {
    result.wordCount = countWords(markdown);

    return result;
  }

  const parts = markdown.split("---");

  if (parts.length < 3) {
    result.wordCount = countWords(markdown);

    return result;
  }

  const metadata = parts[1];

  const content = parts.slice(2).join("---").trim();

  metadata.split("\n").forEach((line) => {
    const idx = line.indexOf(":");

    if (idx === -1) {
      return;
    }

    const key = line.substring(0, idx).trim();

    const value = line.substring(idx + 1).trim();

    switch (key) {
      case "title":
        result.title = value;
        break;

      case "date":
        result.date = value;
        break;

      case "excerpt":
        result.excerpt = value;
        break;

      case "tags":
        result.tags = value
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        break;
    }
  });

  result.content = content;

  result.wordCount = countWords(content);

  return result;
}

function countWords(text) {
  if (!text) {
    return 0;
  }

  return text.trim().split(/\s+/).length;
}

function estimateReadingTime(wordCount) {
  const minutes = Math.max(1, Math.ceil(wordCount / 200));

  return `${minutes} min read`;
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function showError(message) {
  articleTitle.textContent = "Error";

  articleMeta.textContent = "";

  articleContent.innerHTML = `<p>${escapeHtml(message)}</p>`;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
