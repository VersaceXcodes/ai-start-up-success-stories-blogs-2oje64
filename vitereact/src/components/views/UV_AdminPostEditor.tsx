import React, { useState, useEffect, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch, add_notification } from "@/store/main";

const UV_AdminPostEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const jwt_token = useSelector((state: RootState) => state.auth_state.jwt_token);
  
  const [is_loading, set_is_loading] = useState(false);
  const [form_error, set_form_error] = useState("");
  const [is_edit_mode, set_is_edit_mode] = useState(false);
  const [available_tags, set_available_tags] = useState<{ id: string; tag_name: string }[]>([]);
  
  const [post_form_data, set_post_form_data] = useState({
    title: "",
    excerpt: "",
    body_content: "",
    featured_image_url: "",
    publication_date: "",
    status: "",
    tags: [] as string[],
  });

  const base_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    // Fetch available tags from the backend.
    axios
      .get(`${base_url}/api/tags`)
      .then((response) => {
        set_available_tags(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tags:", error);
      });
  }, [base_url]);

  useEffect(() => {
    if (id) {
      // We are editing an existing post.
      set_is_edit_mode(true);
      set_is_loading(true);
      axios
        .get(`${base_url}/api/blog_posts/${id}`)
        .then((response) => {
          const data = response.data;
          set_post_form_data({
            title: data.title || "",
            excerpt: data.excerpt || "",
            body_content: data.body_content || "",
            featured_image_url: data.featured_image_url || "",
            publication_date: data.publication_date || "",
            status: data.status || "",
            tags: data.tags || [],
          });
        })
        .catch((error) => {
          set_form_error("Failed to load post data.");
        })
        .finally(() => {
          set_is_loading(false);
        });
    }
  }, [id, base_url]);

  const handle_input_change = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    set_post_form_data((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handle_body_content_change = (e: ChangeEvent<HTMLTextAreaElement>) => {
    set_post_form_data((prev) => ({
      ...prev,
      body_content: e.target.value,
    }));
  };

  const handle_featured_image_change = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        set_post_form_data((prev) => ({
          ...prev,
          featured_image_url: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handle_tags_change = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected_options = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    set_post_form_data((prev) => ({
      ...prev,
      tags: selected_options,
    }));
  };

  const validate_form = (): boolean => {
    if (
      !post_form_data.title ||
      !post_form_data.excerpt ||
      !post_form_data.body_content ||
      !post_form_data.publication_date
    ) {
      set_form_error("Please fill out all required fields.");
      return false;
    }
    return true;
  };

  const save_draft = async () => {
    set_form_error("");
    if (!validate_form()) {
      return;
    }
    set_is_loading(true);
    const url = is_edit_mode
      ? `${base_url}/api/blog_posts/${id}`
      : `${base_url}/api/blog_posts`;
    const method = is_edit_mode ? "put" : "post";
    const payload = {
      ...post_form_data,
      status: "draft",
    };
    try {
      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt_token}`,
        },
      });
      dispatch(
        add_notification({
          notification_id: new Date().getTime().toString(),
          message: "Post saved as draft successfully",
          type: "success",
          timestamp: new Date().toISOString(),
        })
      );
      if (!is_edit_mode && response.data.id) {
        set_is_edit_mode(true);
      }
    } catch (error: any) {
      set_form_error("Failed to save draft. " + error);
    } finally {
      set_is_loading(false);
    }
  };

  const publish_post = async () => {
    set_form_error("");
    if (!validate_form()) {
      return;
    }
    set_is_loading(true);
    const url = is_edit_mode
      ? `${base_url}/api/blog_posts/${id}`
      : `${base_url}/api/blog_posts`;
    const method = is_edit_mode ? "put" : "post";
    const pub_date = new Date(post_form_data.publication_date);
    const now = new Date();
    // Determine status: if publication_date is in future, then "scheduled" else "published"
    const status = pub_date > now ? "scheduled" : "published";
    const payload = { ...post_form_data, status };
    try {
      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt_token}`,
        },
      });
      dispatch(
        add_notification({
          notification_id: new Date().getTime().toString(),
          message: "Post published successfully",
          type: "success",
          timestamp: new Date().toISOString(),
        })
      );
      if (!is_edit_mode && response.data.id) {
        set_is_edit_mode(true);
      }
    } catch (error: any) {
      set_form_error("Failed to publish post. " + error);
    } finally {
      set_is_loading(false);
    }
  };

  const open_preview = () => {
    // Transfer current post_form_data to preview view
    navigate(
      `/admin/posts/${is_edit_mode && id ? id : "new"}/preview`,
      { state: { post_preview_data: post_form_data } }
    );
  };

  return (
    <>
      {is_loading && (
        <div className="text-center text-blue-500">Loading...</div>
      )}
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          {is_edit_mode ? "Edit Blog Post" : "Create New Blog Post"}
        </h1>
        {form_error && (
          <div className="mb-4 text-red-500">{form_error}</div>
        )}
        <form className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium mb-1"
            >
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={post_form_data.title}
              onChange={handle_input_change}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium mb-1"
            >
              Excerpt <span className="text-red-600">*</span>
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={post_form_data.excerpt}
              onChange={handle_input_change}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label
              htmlFor="body_content"
              className="block text-sm font-medium mb-1"
            >
              Body Content <span className="text-red-600">*</span>
            </label>
            <textarea
              id="body_content"
              name="body_content"
              value={post_form_data.body_content}
              onChange={handle_body_content_change}
              className="w-full border rounded p-2 h-40"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports basic formatting (e.g., bold, italics, lists).
            </p>
          </div>
          <div>
            <label
              htmlFor="featured_image"
              className="block text-sm font-medium mb-1"
            >
              Featured Image
            </label>
            <input
              type="file"
              id="featured_image"
              accept="image/*"
              onChange={handle_featured_image_change}
              className="w-full"
            />
            {post_form_data.featured_image_url && (
              <img
                src={post_form_data.featured_image_url}
                alt="Featured Preview"
                className="mt-2 h-40 object-contain"
              />
            )}
          </div>
          <div>
            <label
              htmlFor="publication_date"
              className="block text-sm font-medium mb-1"
            >
              Publication Date <span className="text-red-600">*</span>
            </label>
            <input
              type="datetime-local"
              id="publication_date"
              name="publication_date"
              value={post_form_data.publication_date}
              onChange={handle_input_change}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium mb-1"
            >
              Tags/Categories
            </label>
            <select
              id="tags"
              name="tags"
              multiple
              value={post_form_data.tags}
              onChange={handle_tags_change}
              className="w-full border rounded p-2"
            >
              {available_tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.tag_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={save_draft}
              disabled={is_loading}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={open_preview}
              disabled={is_loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={publish_post}
              disabled={is_loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UV_AdminPostEditor;