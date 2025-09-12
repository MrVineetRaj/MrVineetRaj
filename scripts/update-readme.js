"use strict";
const axios = require("axios");
const fs = require("fs");

// Use your own reliable API endpoint
const API_URL = "https://www.mrvineetraj.live/api/blog";
const README_PATH = "./README.md";
const START_TAG = "## 📝 Latest Tech Articles";
const END_TAG = `<div align="center">
  <a href="https://blog.unknownbug.tech" target="_blank">
    <img src="https://img.shields.io/badge/📖%20Read%20More%20Articles-2962FF?style=for-the-badge&logo=hashnode&logoColor=white&labelColor=2962FF" alt="More Articles" height="40"/>
  </a>
</div>`;

async function fetchLatestPosts() {
  try {
    const { data } = await axios.get(API_URL);
    if (!data.success || !data.posts || data.posts.length === 0) {
      console.log("No posts found from the API.");
      return null;
    }
    return data.posts;
  } catch (error) {
    console.error("Error fetching posts from your API route:", error);
    return null;
  }
}

function generateContent(posts) {
  const postsToDisplay = posts.slice(0, 20);

  // 1. Get the 4 most recent posts for the image grid
  const recentPosts = postsToDisplay.slice(0, 4);

  // 2. Get the next 16 posts for the text list
  const olderPosts = postsToDisplay.slice(4);

  // 3. Generate the HTML for the image grid
let recentPostsHtml = "<table>\n";
recentPosts.forEach((post, index) => {
  recentPostsHtml += index % 2 === 0 ? "<tr>\n" : "";
  recentPostsHtml += `<td width="50%" align="center">
  <a href="${post.link}" target="_blank">
    <img src="${post.coverImage}" alt="${post.title}" width="100%"/>
  </a>
  <br />
  <a href="${post.link}" target="_blank"><strong>${post.title}</strong></a>
</td>
`;

  recentPostsHtml += index % 2 === 1 ? "  </tr>\n" : "";
});

// Handle odd number of posts - close the last row if needed
if (recentPosts.length % 2 === 1) {
  recentPostsHtml += "\n</tr>\n";
}

recentPostsHtml += "\n</table>\n\n";

  // 4. Generate the Markdown for the older posts list
  
  return recentPostsHtml;
}

async function updateReadme() {
  const posts = await fetchLatestPosts();
  if (posts === null) {
    console.log("Aborting README update due to fetch error.");
    return;
  }

  const newGeneratedContent = generateContent(posts);

  // Add debug logging
  console.log("Generated content length:", newGeneratedContent.length);
  console.log(
    "Generated content preview:",
    newGeneratedContent.substring(0, 200)
  );

  const readmeContent = fs.readFileSync(README_PATH, "utf-8");

  // Find the start and end positions using indexOf
  const startIndex = readmeContent.indexOf(START_TAG);
  const endIndex = readmeContent.indexOf(END_TAG);

  // Add debug logging
  console.log("Start tag found at index:", startIndex);
  console.log("End tag found at index:", endIndex);

  if (startIndex === -1 || endIndex === -1) {
    console.log("Start or end tag not found in README.md");
    console.log("Looking for START_TAG:", START_TAG);
    console.log("Looking for END_TAG:", END_TAG);
    return;
  }

  // Calculate the end position (including the end tag)
  const endPosition = endIndex + END_TAG.length;

  // Build new content: before + start tag + new content + end tag + after
  const newReadmeContent =
    readmeContent.substring(0, startIndex) +
    START_TAG +
    "\n\n" +
    newGeneratedContent.trim() +
    "\n\n" +
    END_TAG +
    "\n" +
    readmeContent.substring(endPosition);

  // Add debug loggi
  fs.writeFileSync(README_PATH, newReadmeContent);
  console.log("README.md updated with new image grid and article list!");
}

updateReadme();
