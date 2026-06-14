const fs = require("fs");
const path = require("path");

const BLOG_DIR = "blogs";
const OUTPUT_FILE = "blog-index.json";

function parseFrontMatter(content) {

    const result = {
        title: "",
        date: "",
        tags: [],
        excerpt: ""
    };

    if (!content.startsWith("---")) {
        return result;
    }

    const parts = content.split("---");

    if (parts.length < 3) {
        return result;
    }

    const metadata = parts[1];

    metadata
        .split("\n")
        .forEach(line => {

            const idx = line.indexOf(":");

            if (idx === -1) {
                return;
            }

            const key =
                line.substring(0, idx).trim();

            const value =
                line.substring(idx + 1).trim();

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
                    result.tags =
                        value
                            .split(",")
                            .map(v => v.trim())
                            .filter(Boolean);
                    break;
            }
        });

    return result;
}

function countWords(text) {

    return text
        .replace(/^---[\s\S]*?---/, "")
        .trim()
        .split(/\s+/)
        .length;
}

function buildIndex() {

    const files =
        fs.readdirSync(BLOG_DIR)
          .filter(file => file.endsWith(".md"));

    const posts = [];

    for (const file of files) {

        const fullPath =
            path.join(BLOG_DIR, file);

        const content =
            fs.readFileSync(
                fullPath,
                "utf8"
            );

        const metadata =
            parseFrontMatter(content);

        posts.push({

            title:
                metadata.title ||
                file,

            date:
                metadata.date,

            tags:
                metadata.tags,

            excerpt:
                metadata.excerpt,

            wordCount:
                countWords(content),

            file:
                file
        });
    }

    posts.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );

    fs.writeFileSync(
        OUTPUT_FILE,
        JSON.stringify(
            posts,
            null,
            2
        )
    );

    console.log(
        `Generated ${posts.length} posts`
    );
}

buildIndex();   