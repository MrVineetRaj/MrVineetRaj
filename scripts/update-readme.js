const axios = require("axios");
const fs = require("fs");

const HASHNODE_USERNAME = "mrvineetraj"; // Your Hashnode username
const README_PATH = "./README.md";

const GET_USER_ARTICLES = `
  query GetUserArticles($username: String!) {
    user(username: $username) {
      publication {
        posts(page: 0) {
          slug
          title
          brief
          dateAdded
        }
      }
    }
  }
`;

async function fetchLatestPosts() {
  try {
    const { data } = await axios.post("https://api.hashnode.com/", {
      query: GET_USER_ARTICLES,
      variables: { username: HASHNODE_USERNAME },
    });

    const posts = data.data.user.publication.posts;
    if (!posts || posts.length === 0) {
      console.log("No posts found.");
      return "";
    }

    // Format the posts into a Markdown list
    const markdownList = posts
      .slice(0, 5) // Get the latest 5 posts
      .map((post) => {
        const postDate = new Date(post.dateAdded).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const postUrl = `https://${HASHNODE_USERNAME}.hashnode.dev/${post.slug}`;
        return `* [${post.title}](${postUrl}) - *${postDate}*`;
      })
      .join("\n");

    return markdownList;
  } catch (error) {
    console.error("Error fetching Hashnode posts:", error);
    return null;
  }
}

async function updateReadme() {
  const latestPostsMD = await fetchLatestPosts();
  if (latestPostsMD === null) {
    console.log("Aborting README update due to fetch error.");
    return;
  }

  const readmeContent = fs.readFileSync(README_PATH, "utf-8");

  const startTag = "";
  const endTag = "";

  const startIndex = readmeContent.indexOf(startTag);
  const endIndex = readmeContent.indexOf(endTag);

  if (startIndex === -1 || endIndex === -1) {
    console.error("Placeholder tags not found in README.md");
    return;
  }

  const newReadmeContent = [
    readmeContent.slice(0, startIndex + startTag.length),
    "\n",
    latestPostsMD,
    "\n",
    readmeContent.slice(endIndex),
  ].join("");

  fs.writeFileSync(README_PATH, newReadmeContent);
  console.log("README.md updated successfully with latest blog posts.");
}

updateReadme();
