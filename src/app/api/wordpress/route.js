import { NextResponse } from "next/server";
import { marked } from "marked";
import he from "he";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  try {
    let url;
    if (slug) {
      url = `${process.env.WORDPRESS_API_URL}/posts?_embed&slug=${slug}`;
    } else {
      url = `${process.env.WORDPRESS_API_URL}/posts?_embed&per_page=100`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch from WordPress");

    const data = await response.json();

    if (slug) {
      const formattedPost = data.length > 0 ? formatBlogPost(data[0]) : null;
      return NextResponse.json(formattedPost);
    } else {
      const formattedBlogs = formatBlogPosts(data);
      return NextResponse.json(formattedBlogs);
    }
  } catch (error) {
    console.error("Error fetching from WordPress:", error);
    return NextResponse.json(
      { error: "Failed to fetch from WordPress" },
      { status: 500 }
    );
  }
}

// Helper function to get category ID from category name
async function getCategoryId(categoryName) {
  try {
    const response = await fetch(
      `${
        process.env.WORDPRESS_API_URL
      }/categories?slug=${categoryName.toLowerCase()}`
    );

    if (!response.ok) throw new Error("Failed to fetch category");

    const categories = await response.json();
    if (categories.length > 0) {
      return categories[0].id;
    }

    return 0; // Return 0 if category not found
  } catch (error) {
    console.error("Error fetching category ID:", error);
    return 0;
  }
}

export async function POST(request) {
  try {
    const { category } = await request.json();
    let url = `${process.env.WORDPRESS_API_URL}/posts?_embed&per_page=10`;

    if (category && category !== "all") {
      url += `&category=${category}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch blogs from WordPress");

    const data = await response.json();
    // console.log("Raw WordPress API response:", JSON.stringify(data, null, 2));
    const formattedBlogs = formatBlogPosts(data);

    return NextResponse.json(formattedBlogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

function cleanWordPressContent(content) {
  // Check if content exists and is a string
  if (!content || typeof content !== "string") {
    return "";
  }

  // First remove unnecessary newlines and spaces from WordPress
  let cleanContent = content
    // Remove excessive newlines and spaces
    .replace(/\n\n+/g, "\n")
    .trim();

  // Then add proper spacing based on HTML structure
  cleanContent = cleanContent
    // Add space after horizontal rules
    .replace(/<hr[^>]*>/g, '<hr class="wp-block-separator" />\n\n')
    // Handle headings
    .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/g, (match, level, content) => {
      return `\n\n<h${level}>${content}</h${level}>\n\n`;
    })
    // Handle paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/g, "<p>$1</p>\n\n")
    // Handle lists
    .replace(/<ul[^>]*>/g, "\n<ul>")
    .replace(/<\/ul>/g, "</ul>\n\n")
    .replace(/<li[^>]*>(.*?)<\/li>\n/g, "<li>$1</li>")
    // Handle figures/images
    .replace(/<figure[^>]*>(.*?)<\/figure>/g, "\n\n<figure>$1</figure>\n\n")
    // Clean up multiple spaces
    .replace(/\s\s+/g, " ")
    // Clean up multiple newlines
    .replace(/\n\n\n+/g, "\n\n");

  return cleanContent;
}

function formatBlogPost(post) {
  let categories = [];
  if (
    post._embedded &&
    post._embedded["wp:term"] &&
    post._embedded["wp:term"][0]
  ) {
    categories = post._embedded["wp:term"][0].map((term) => term.name);
  }
  if (categories.length === 0) {
    categories.push("Uncategorized");
  }

  const thumbnail = post.jetpack_featured_media_url || "/default-thumbnail.jpg";

  return {
    id: post.id,
    title: post.title.rendered || "Untitled",
    slug: post.slug,
    content: post.content ? post.content.rendered : "",
    excerpt: post.excerpt ? post.excerpt.rendered : "",
    date: post.date ? new Date(post.date).toLocaleDateString() : "No date",
    categories,
    thumbnail,
  };
}

function formatBlogPosts(posts) {
  return posts.map(formatBlogPost);
}

// Add this function to fetch category names
async function getCategoryNames(categoryIds) {
  try {
    // Fetch all categories in one request
    const response = await fetch(`${process.env.WORDPRESS_API_URL}/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");

    const categories = await response.json();

    // Create a map of id to name
    const categoryMap = categories.reduce((map, cat) => {
      map[cat.id] = cat.name;
      return map;
    }, {});

    // Convert IDs to names, fallback to "Uncategorized" if not found
    return categoryIds.map((id) => categoryMap[id] || "Uncategorized");
  } catch (error) {
    console.error("Error fetching category names:", error);
    return ["Uncategorized"];
  }
}
