import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/main";

interface PostPreviewData {
  title: string;
  excerpt: string;
  body_content: string;
  featured_image_url: string;
  publication_date: string;
  status: string;
  tags: string[];
}

const defaultPreviewData: PostPreviewData = {
  title: "",
  excerpt: "",
  body_content: "",
  featured_image_url: "",
  publication_date: "",
  status: "",
  tags: []
};

const UV_AdminPostPreview: React.FC = () => {
  // Get the post id from the URL slugs
  const { id: postId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // Access the global notifications_state if needed (for potential warnings)
  const notifications_state = useSelector((state: RootState) => state.notifications_state);

  // Local state to store the preview data passed from the editor
  const [post_preview_data, setPostPreviewData] = useState<PostPreviewData>(defaultPreviewData);

  useEffect(() => {
    // Try to retrieve preview data from location.state (passed from the editor)
    if (location.state && (location.state as any).post_form_data) {
      setPostPreviewData((location.state as any).post_form_data);
    }
  }, [location.state]);

  // Function to handle social share actions
  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    let shareLink = "";
    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          post_preview_data.title
        )}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        break;
    }
    window.open(shareLink, "_blank", "width=600,height=400");
  };

  // Function to return to the editor view, passing current preview data along
  const returnToEditor = () => {
    navigate(`/admin/posts/${postId}/edit`, { state: { post_form_data: post_preview_data } });
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Admin Post Preview</h1>
        {post_preview_data.title ? (
          <>
            <h2 className="text-2xl font-bold mb-2">{post_preview_data.title}</h2>
            {post_preview_data.publication_date && (
              <p className="text-gray-600 mb-4">Published on {post_preview_data.publication_date}</p>
            )}
            {post_preview_data.featured_image_url && (
              <img
                src={post_preview_data.featured_image_url}
                alt={post_preview_data.title}
                className="w-full h-auto mb-4"
              />
            )}
            <div className="prose mb-4" dangerouslySetInnerHTML={{ __html: post_preview_data.body_content }}></div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Tags:</h3>
              {post_preview_data.tags && post_preview_data.tags.length > 0 ? (
                <ul className="flex flex-wrap space-x-2">
                  {post_preview_data.tags.map((tag, index) => (
                    <li key={index} className="bg-gray-200 px-3 py-1 rounded">
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No tags available</p>
              )}
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => handleShare("twitter")}
                className="px-4 py-2 bg-blue-500 text-white rounded"
                type="button"
              >
                Share on Twitter
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="px-4 py-2 bg-blue-700 text-white rounded"
                type="button"
              >
                Share on LinkedIn
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="px-4 py-2 bg-blue-600 text-white rounded"
                type="button"
              >
                Share on Facebook
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 mb-4">
            <p>No preview data available. Please return to the editor to create a preview.</p>
          </div>
        )}
        <div className="mt-6">
          <button
            onClick={returnToEditor}
            className="px-4 py-2 bg-gray-800 text-white rounded"
            type="button"
          >
            Return to Editor
          </button>
        </div>
      </div>
    </>
  );
};

export default UV_AdminPostPreview;