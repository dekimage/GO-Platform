import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  try {
    let url;
    if (slug) {
      // Fetch a single post by slug
      url = `${process.env.WORDPRESS_API_URL}/posts?_embed&slug=${slug}`;
    } else {
      // Fetch all posts (existing functionality)
      url = `${process.env.WORDPRESS_API_URL}/posts?_embed&per_page=10`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch from WordPress");

    const data = await response.json();
    // console.log("Raw WordPress API response:", JSON.stringify(data, null, 2));

    if (slug) {
      // For single post, return the first (and only) item
      const formattedPost = data.length > 0 ? formatBlogPost(data[0]) : null;
      return NextResponse.json(formattedPost);
    } else {
      // For multiple posts, format all of them
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

  console.log("Categories for post", post.id, ":", categories);

  const thumbnail = post.jetpack_featured_media_url || "/default-thumbnail.jpg";

  return {
    id: post.id,
    title: post.title.rendered || "Untitled",
    slug: post.slug,
    content: post.content ? post.content.rendered : "",
    excerpt: post.excerpt ? post.excerpt.rendered : "",
    date: post.date ? new Date(post.date).toLocaleDateString() : "No date",
    categories, // Now it's an array of all categories
    thumbnail,
  };
}

function formatBlogPosts(posts) {
  return posts.map(formatBlogPost);
}
