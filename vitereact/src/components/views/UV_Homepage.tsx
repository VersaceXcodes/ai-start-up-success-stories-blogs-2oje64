import React, { useState, useEffect, FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

const UV_Homepage: React.FC = () => {
  // Get URL search parameters:
  const [searchParams, setSearchParams] = useSearchParams();
  const initial_search = searchParams.get("search") || "";
  const initial_tags = searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [];
  const initial_page = parseInt(searchParams.get("page") || "1", 10);

  // Local state variables
  const [blog_posts_list, setBlogPostsList] = useState<Array<{
    id: string;
    title: string;
    excerpt: string;
    featured_image_url: string | null;
    publication_date: string;
    status: string;
    tags: string[];
  }>>([]);
  const [search_keyword, setSearchKeyword] = useState<string>(initial_search);
  const [filter_tags, setFilterTags] = useState<string[]>(initial_tags);
  const [current_page, setCurrentPage] = useState<number>(initial_page);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // States for form inputs (separate from actual search_keyword and filter_tags used for queries)
  const [searchInput, setSearchInput] = useState<string>(initial_search);
  const [tagsInput, setTagsInput] = useState<string>(initial_tags.join(","));

  // Base URL for API calls
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Effect to fetch data every time current_page, search_keyword, or filter_tags changes
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Prepare query parameters; join filter_tags array into a comma-separated string
        const params = {
          search: search_keyword,
          tags: filter_tags.join(","),
          page: current_page,
        };
        // Call backend API; endpoint: GET /api/blog_posts
        const response = await axios.get(`${baseUrl}/api/blog_posts`, { params });
        // Response data is expected to be an array of blog post summary objects
        if (current_page > 1) {
          setBlogPostsList((prev) => [...prev, ...response.data]);
        } else {
          setBlogPostsList(response.data);
        }
      } catch (error) {
        console.error("Error fetching blog posts", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
    // Update the URL search parameters according to state
    setSearchParams({
      search: search_keyword,
      tags: filter_tags.join(","),
      page: current_page.toString(),
    });
  }, [current_page, search_keyword, filter_tags, baseUrl, setSearchParams]);

  // Handler for search form submission: update search_keyword and filter_tags, reset current_page
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchKeyword(searchInput);
    const tagsArray = tagsInput.trim() !== "" ? tagsInput.split(",").map((t) => t.trim()) : [];
    setFilterTags(tagsArray);
    setCurrentPage(1);
  };

  // Handler for "Load More" button click: increment page
  const handleLoadMore = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gray-200 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Discover the Journey of AI Innovation</h1>
        <p className="text-xl text-gray-700">Inspiring stories of groundbreaking AI startups.</p>
      </section>

      {/* Search and Filter Form */}
      <section className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Filter by tags (comma separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Search
          </button>
        </form>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        {isLoading && blog_posts_list.length === 0 && (
          <div className="text-center py-4">Loading posts...</div>
        )}
        {!isLoading && blog_posts_list.length === 0 ? (
          <div className="text-center py-4">No posts found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blog_posts_list.map((post) => (
              <div key={post.id} className="border rounded shadow hover:shadow-lg transition duration-200">
                {post.featured_image_url ? (
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t"
                  />
                ) : (
                  <img
                    src="https://picsum.photos/seed/default/400/300"
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2">
                    <Link to={`/blog/${post.id}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Published on {new Date(post.publication_date).toLocaleDateString()}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-200 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Load More Button */}
      {blog_posts_list.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-6 text-center">
          {isLoading ? (
            <button disabled className="bg-blue-600 text-white px-4 py-2 rounded opacity-50">
              Loading...
            </button>
          ) : (
            <button onClick={handleLoadMore} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Load More
            </button>
          )}
        </section>
      )}
    </>
  );
};

export default UV_Homepage;