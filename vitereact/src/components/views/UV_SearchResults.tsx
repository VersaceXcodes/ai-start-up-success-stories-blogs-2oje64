import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const UV_SearchResults: React.FC = () => {
  // Get the search param from URL: 'q'
  const [searchParams] = useSearchParams();
  const initial_query = searchParams.get("q") || "";
  
  // Local state variables as defined in the data map
  const [search_query, set_search_query] = useState<string>(initial_query);
  const [searched_posts, set_searched_posts] = useState<
    Array<{
      id: string;
      title: string;
      excerpt: string;
      featured_image_url: string | null;
      publication_date: string;
      status: string;
      tags: string[];
    }>
  >([]);
  const [is_loading, set_is_loading] = useState<boolean>(false);
  const [error, set_error] = useState<string>("");

  const navigate = useNavigate();

  // Function to execute search query
  const execute_search = async () => {
    if (!search_query.trim()) {
      set_searched_posts([]);
      return;
    }
    try {
      set_is_loading(true);
      set_error("");
      const base_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await axios.get(`${base_url}/api/blog_posts`, {
        params: { search: search_query },
      });
      // Assume the response returns an array of blog post list items
      set_searched_posts(response.data);
    } catch (err) {
      set_error("Error fetching search results. Please try again later.");
    } finally {
      set_is_loading(false);
    }
  };

  // Execute search on page load if initial query exists
  useEffect(() => {
    if (search_query) {
      execute_search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search form submission
  const handle_search_submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Update URL query parameter
    navigate(`/search?q=${encodeURIComponent(search_query)}`);
    execute_search();
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <form onSubmit={handle_search_submit} className="mb-6 flex">
          <input
            type="text"
            value={search_query}
            onChange={(e) => set_search_query(e.target.value)}
            placeholder="Search blog posts..."
            className="flex-grow border border-gray-300 rounded-l px-4 py-2 outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        {/* Display loading, error, or results */}
        {is_loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!is_loading && !error && (
          <>
            {/* Show search criteria and result count */}
            <p className="mb-4">
              Results for "<span className="font-semibold">{search_query}</span>" - {searched_posts.length} result(s) found.
            </p>
            {searched_posts.length === 0 ? (
              <p className="text-gray-600">No results found.</p>
            ) : (
              <ul className="space-y-4">
                {searched_posts.map((post) => (
                  <li key={post.id} className="border border-gray-200 rounded p-4">
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover mb-4"
                      />
                    )}
                    <h2 className="text-xl font-bold mb-2">
                      <Link to={`/blog/${post.id}`} className="text-blue-600 hover:underline">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 text-sm mb-2">
                      {new Date(post.publication_date).toLocaleDateString()}
                    </p>
                    <p className="mb-2">{post.excerpt}</p>
                    <div className="flex flex-wrap space-x-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default UV_SearchResults;