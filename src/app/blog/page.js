"use client";

import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Clock, User } from "lucide-react";
import Link from "next/link";

import MobxStore from "@/mobx";
import { LoadingSpinner } from "@/reusable-ui/LoadingSpinner";
import Image from "next/image";

const BlogPage = observer(() => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    MobxStore.fetchBlogs();
  }, []);

  if (MobxStore.blogsLoading) {
    return <LoadingSpinner />;
  }

  const filteredPosts = MobxStore.blogs
    .filter((post) => {
      const matchesSearch = post.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        post.categories.some(
          (category) =>
            category.toLowerCase() === selectedCategory.toLowerCase()
        );
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get unique categories from all posts
  const categories = [
    ...new Set(MobxStore.blogs.flatMap((post) => post.categories)),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-strike uppercase mb-4">Blog</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Blog Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-xl mt-8">No blogs found.</p>
      )}
    </div>
  );
});

const BlogCard = ({ post }) => {
  // Calculate read time (rough estimate)
  const wordCount = post.content.split(" ").length;
  const readTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={post.thumbnail}
          alt={post.title}
          width={500}
          height={500}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex gap-2 mb-2 flex-wrap">
          {post.categories.map((category) => (
            <span
              key={category}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
        <h2 className="text-xl font-semibold line-clamp-2">{post.title}</h2>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{readTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{post.date}</span>
          </div>
        </div>
        <div
          className="line-clamp-3 text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: post.excerpt }}
        />
      </CardContent>
      <CardFooter>
        <Link href={`/blog/${post.slug}`} className="w-full">
          <Button className="w-full">Read More</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BlogPage;
