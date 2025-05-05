import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/main";

const GV_AdminNav: React.FC = () => {
  // Local state for currently active navigation item.
  const [active_nav_item, set_active_nav_item] = useState<string>("dashboard");
  // Get authenticated admin information from global state.
  const auth_state = useSelector((state: RootState) => state.auth_state);
  const navigate = useNavigate();

  // Handler for updating the active navigation item.
  const handleNavClick = (item: string) => {
    set_active_nav_item(item);
  };

  // Action for creating a new post (navigates to admin post editor).
  const handleNewPost = () => {
    set_active_nav_item("new_post");
    navigate("/admin/posts/new");
  };

  return (
    <>
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 min-h-full">
        <div className="mb-6 font-bold text-xl border-b border-gray-700 pb-2">
          Admin Panel
        </div>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admin/dashboard"
            onClick={() => handleNavClick("dashboard")}
            className={
              active_nav_item === "dashboard"
                ? "bg-gray-700 p-2 rounded"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            Dashboard
          </Link>
          {/* New Post button styled to be prominent */}
          <button
            onClick={handleNewPost}
            className={
              active_nav_item === "new_post"
                ? "bg-blue-600 hover:bg-blue-700 p-2 rounded text-left"
                : "bg-blue-500 hover:bg-blue-600 p-2 rounded text-left"
            }
          >
            New Post
          </button>
          {/* Posts List - we assume it maps to the same dashboard view for now */}
          <Link
            to="/admin/dashboard?view=posts_list"
            onClick={() => handleNavClick("posts_list")}
            className={
              active_nav_item === "posts_list"
                ? "bg-gray-700 p-2 rounded"
                : "hover:bg-gray-700 p-2 rounded"
            }
          >
            Posts List
          </Link>
          {/* Profile/Settings - not implemented; shows an alert on click */}
          <button
            onClick={() => {
              handleNavClick("settings");
              alert("Profile/Settings not implemented");
            }}
            className={
              active_nav_item === "settings"
                ? "bg-gray-700 p-2 rounded text-left"
                : "hover:bg-gray-700 p-2 rounded text-left"
            }
          >
            Profile/Settings
          </button>
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-700">
          {auth_state && auth_state.user ? (
            <div className="text-sm">
              Logged in as: <span className="font-medium">{auth_state.user.username}</span>
            </div>
          ) : (
            <div className="text-sm">No user</div>
          )}
        </div>
      </aside>
    </>
  );
};

export default GV_AdminNav;