import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { set_auth } from "@/store/main";

const UV_AdminLogin: React.FC = () => {
  const [admin_username, setAdminUsername] = useState<string>("");
  const [admin_password, setAdminPassword] = useState<string>("");
  const [login_error, setLoginError] = useState<string>("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handle_login = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic check to ensure both fields are filled
    if (!admin_username || !admin_password) {
      setLoginError("Please provide both username and password.");
      return;
    }
    try {
      const base_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await axios.post(`${base_url}/api/auth/login`, {
        username: admin_username,
        password: admin_password,
      });
      // Assuming successful response contains token and user details:
      // { token: string, user: { id: string, username: string, role: string } }
      dispatch(set_auth({
        user: response.data.user,
        jwt_token: response.data.token,
      }));
      setLoginError("");
      navigate("/admin/dashboard");
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setLoginError(error.response.data.message);
      } else {
        setLoginError("Login failed. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          {login_error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
              {login_error}
            </div>
          )}
          <form onSubmit={handle_login}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                value={admin_username}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                value={admin_password}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UV_AdminLogin;