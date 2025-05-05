import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import type { RootState } from "@/store/main";
import { set_loading, add_notification } from "@/store/main";

interface PostItem {
  id: string;
  title: string;
  publication_date: string;
  status: string;
}

interface DashboardMetrics {
  published: number;
  draft: number;
  scheduled: number;
}

const UV_AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const jwt_token = useSelector((state: RootState) => state.auth_state.jwt_token);
  const global_loading = useSelector((state: RootState) => state.global_loading_state.is_loading);

  const [admin_posts_list, set_admin_posts_list] = useState<PostItem[]>([]);
  const [dashboard_metrics, set_dashboard_metrics] = useState<DashboardMetrics>({
    published: 0,
    draft: 0,
    scheduled: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const refresh_dashboard_data = async () => {
    try {
      dispatch(set_loading(true));
      const response = await axios.get(`${baseUrl}/api/blog_posts`, {
        headers: { Authorization: `Bearer ${jwt_token}` },
      });
      const posts: PostItem[] = response.data;
      set_admin_posts_list(posts);

      const metrics: DashboardMetrics = { published: 0, draft: 0, scheduled: 0 };
      posts.forEach((post) => {
        if (post.status === "published") {
          metrics.published++;
        } else if (post.status === "draft") {
          metrics.draft++;
        } else if (post.status === "scheduled") {
          metrics.scheduled++;
        }
      });
      set_dashboard_metrics(metrics);
      dispatch(
        add_notification({
          notification_id: "notif_" + Date.now(),
          message: "Dashboard data refreshed successfully",
          type: "success",
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      dispatch(
        add_notification({
          notification_id: "notif_" + Date.now(),
          message: "Failed to refresh dashboard data",
          type: "error",
          timestamp: new Date().toISOString(),
        })
      );
      console.error("Error refreshing dashboard data", error);
    } finally {
      dispatch(set_loading(false));
    }
  };

  const delete_post = async (post_id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }
    try {
      dispatch(set_loading(true));
      await axios.delete(`${baseUrl}/api/blog_posts/${post_id}`, {
        headers: { Authorization: `Bearer ${jwt_token}` },
      });
      dispatch(
        add_notification({
          notification_id: "notif_" + Date.now(),
          message: "Post deleted successfully",
          type: "success",
          timestamp: new Date().toISOString(),
        })
      );
      // Refresh dashboard data after deletion
      refresh_dashboard_data();
    } catch (error) {
      dispatch(
        add_notification({
          notification_id: "notif_" + Date.now(),
          message: "Failed to delete post",
          type: "error",
          timestamp: new Date().toISOString(),
        })
      );
      console.error("Error deleting post", error);
    } finally {
      dispatch(set_loading(false));
    }
  };

  useEffect(() => {
    refresh_dashboard_data();
  }, []);

  const filtered_posts = admin_posts_list.filter((post) => {
    const matches_search = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matches_status =
      filterStatus === "All" || post.status.toLowerCase() === filterStatus.toLowerCase();
    return matches_search && matches_status;
  });

  return (
    <>
      {global_loading && (
        <div className="absolute top-0 left-0 right-0 bg-blue-200 text-center py-2">
          Loading...
        </div>
      )}
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <button
          onClick={refresh_dashboard_data}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">Published</h2>
            <p className="text-4xl">{dashboard_metrics.published}</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">Draft</h2>
            <p className="text-4xl">{dashboard_metrics.draft}</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">Scheduled</h2>
            <p className="text-4xl">{dashboard_metrics.scheduled}</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center mb-4">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded mr-2 mb-2 md:mb-0"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Title</th>
                <th className="py-2 px-4 border-b">Publication Date</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered_posts.length > 0 ? (
                filtered_posts.map((post) => (
                  <tr key={post.id}>
                    <td className="py-2 px-4 border-b">{post.title}</td>
                    <td className="py-2 px-4 border-b">{post.publication_date}</td>
                    <td className="py-2 px-4 border-b capitalize">{post.status}</td>
                    <td className="py-2 px-4 border-b">
                      <Link
                        to={`/admin/posts/${post.id}/edit`}
                        className="text-blue-500 hover:underline mr-2"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => delete_post(post.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 px-4 border-b text-center" colSpan={4}>
                    No posts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UV_AdminDashboard;