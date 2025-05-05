import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/main";

const GV_TopNav_Public: React.FC = () => {
  const [search_input, setSearch_input] = useState<string>("");
  const navigate = useNavigate();
  const auth_state = useSelector((state: RootState) => state.auth_state);

  // Action: navigateToHome - triggered when the logo is clicked.
  const handleLogoClick = () => {
    navigate("/");
  };

  // Action: handleSearchSubmit - triggered when user submits the search query.
  const handleSearchSubmit = () => {
    if (search_input.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(search_input.trim())}`);
    }
  };

  // Trigger search on 'Enter' key press.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" onClick={handleLogoClick}>
                <span className="font-bold text-xl">Site Logo</span>
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link to="/" className="hover:text-blue-500">
                  Home
                </Link>
                <Link to="/" className="hover:text-blue-500">
                  Stories
                </Link>
                <Link to="/about" className="hover:text-blue-500">
                  About
                </Link>
                <Link to="/contact" className="hover:text-blue-500">
                  Contact
                </Link>
                <Link to="/newsletter-signup" className="hover:text-blue-500">
                  Newsletter Signup
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search..."
                value={search_input}
                onChange={(e) => setSearch_input(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border border-gray-300 rounded-l px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearchSubmit}
                className="bg-blue-500 text-white px-3 py-1 rounded-r hover:bg-blue-600"
              >
                Search
              </button>
            </div>
            <div className="md:hidden">
              {/* Mobile menu placeholder - additional mobile menu logic can be added here if needed */}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default GV_TopNav_Public;