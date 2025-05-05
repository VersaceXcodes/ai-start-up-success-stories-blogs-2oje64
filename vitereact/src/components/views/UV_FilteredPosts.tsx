import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image_url: string | null;
  publication_date: string;
  status: string;
  tags: string[];
}

const UV_FilteredPosts: React.FC = () => {
  // useSearchParams to read and update the query parameter "tag"
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State variables based on datamap
  const [filtered_posts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [active_tag, setActiveTag] = useState<string>(searchParams.get("tag") || "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Function to fetch filtered posts from the backend
  const filter_posts_by_tag = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Determine API URL from environment variables, fallback to localhost
      const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      // Build query parameters; if active_tag is empty, fetch without tag filter
      const params: any = {};
      if (active_tag && active_tag.trim() !== "") {
        params.tags = active_tag;
      }
      const response = await axios.get(`${baseURL}/api/blog_posts`, { params });
      setFilteredPosts(response.data);
    } catch (err: any) {
      setError("Failed to load posts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to update active_tag when searchParams changes, and trigger API call
  useEffect(() => {
    const tagFromUrl = searchParams.get("tag") || "";
    setActiveTag(tagFromUrl);
  }, [searchParams]);

  useEffect(() => {
    // Trigger filtering on active_tag change (or on mount)
    filter_posts_by_tag();
  }, [active_tag]);

  // Clear the active filter
  const clearFilters = () => {
    // Remove the tag query parameter so that full listing is returned.
    searchParams.delete("tag");
    setSearchParams(searchParams);
    // Optionally navigate to homepage if full listing is on the homepage
    // navigate("/") can be used instead if that's the intended behavior.
    // For this view, we simply update the filter state.
    setActiveTag("");
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">
            {active_tag ? `Posts filtered by: ${active_tag}` : "All Posts"}
          </h1>
          {active_tag && (
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          )}
        </header>

        {isLoading ? (
          <div className="text-center py-8">
            <span className="text-lg">Loading posts...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <span className="text-red-600">{error}</span>
          </div>
        ) : filtered_posts.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-gray-600">No posts found.</span>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered_posts.map((post) => (
              <div
                key={post.id}
                className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-200"
              >
                {post.featured_image_url && (
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">
                    <Link to={`/blog/${post.id}`} className="text-blue-600 hover:underline">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-700 mb-2">{post.excerpt}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(post.publication_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UV_FilteredPosts;