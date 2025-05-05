import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { RootState } from "@/store/main";
import { clear_auth } from "@/store/main";

const GV_TopNav_Admin: React.FC = () => {
  const [profile_menu_open, set_profile_menu_open] = useState<boolean>(false);
  const auth_state = useSelector((state: RootState) => state.auth_state);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleProfileMenu = () => {
    set_profile_menu_open(!profile_menu_open);
  };

  const logoutAdmin = () => {
    dispatch(clear_auth());
    navigate("/admin/login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gray-800 text-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div>
            <Link to="/admin/dashboard" className="text-xl font-bold">
              Admin Panel
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative" title="Notifications">
              <span role="img" aria-label="Notifications" className="text-2xl">
                🔔
              </span>
            </button>
            <div className="relative">
              <div
                onClick={toggleProfileMenu}
                className="cursor-pointer flex items-center space-x-2"
              >
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm">
                  {auth_state.user
                    ? auth_state.user.username.charAt(0).toUpperCase()
                    : "A"}
                </div>
                <span>
                  {auth_state.user ? auth_state.user.username : "Admin"}
                </span>
                <span>{profile_menu_open ? "▲" : "▼"}</span>
              </div>
              {profile_menu_open && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg">
                  <button
                    onClick={logoutAdmin}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default GV_TopNav_Admin;