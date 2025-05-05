import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

interface BlogPostDetail {
  id: string;
  title: string;
  excerpt: string;
  body_content: string;
  featured_image_url: string | null;
  publication_date: string;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const UV_BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog_post_detail, set_blog_post_detail] = useState<BlogPostDetail | null>(null);
  const [loading_state, set_loading_state] = useState<boolean>(false);
  const [error_state, set_error_state] = useState<string>("");

  useEffect(() => {
    const fetch_post_detail = async () => {
      try {
        set_loading_state(true);
        set_error_state("");
        const base_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        const response = await axios.get(`${base_url}/api/blog_posts/${id}`);
        set_blog_post_detail(response.data);
      } catch (error: any) {
        set_error_state("Error fetching blog post details");
      } finally {
        set_loading_state(false);
      }
    };
    if (id) {
      fetch_post_detail();
    }
  }, [id]);

  const currentUrl = window.location.href;
  const shareText = blog_post_detail ? encodeURIComponent(blog_post_detail.title) : "";
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    currentUrl
  )}&text=${shareText}`;
  const linkedInShareUrl = `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(
    currentUrl
  )}&title=${shareText}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    currentUrl
  )}`;

  return (
    <>
      {loading_state && <div className="text-center mt-8">Loading...</div>}
      {error_state && <div className="text-center text-red-500 mt-8">{error_state}</div>}
      {!loading_state && !error_state && blog_post_detail && (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">{blog_post_detail.title}</h1>
          <div className="text-sm text-gray-500 mb-4">
            <span>
              Published on: {new Date(blog_post_detail.publication_date).toLocaleDateString()}
            </span>
          </div>
          {blog_post_detail.featured_image_url && (
            <div className="mb-4">
              <img
                src={blog_post_detail.featured_image_url}
                alt="Featured"
                className="w-full h-auto rounded"
              />
            </div>
          )}
          <div
            className="prose prose-lg mb-8"
            dangerouslySetInnerHTML={{ __html: blog_post_detail.body_content }}
          ></div>
          <div className="flex space-x-4 mb-8">
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Share on Twitter
            </a>
            <a
              href={linkedInShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline"
            >
              Share on LinkedIn
            </a>
            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Share on Facebook
            </a>
          </div>
          <Link to="/" className="text-indigo-600 hover:underline">
            Back to Home
          </Link>
        </div>
      )}
    </>
  );
};

export default UV_BlogDetail;