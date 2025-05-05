import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "@/store/main";

const GV_Footer_Public: React.FC = () => {
  const global_loading = useSelector((state: RootState) => state.global_loading_state.is_loading);
  const [newsletter_email, setNewsletterEmail] = useState<string>("");

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newsletter_email) {
      alert("Please enter a valid email address.");
      return;
    }
    try {
      const api_base_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${api_base_url}/api/newsletter_subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: newsletter_email })
      });
      if (response.ok) {
        const data = await response.json();
        alert("Subscription successful. Thank you!");
        setNewsletterEmail("");
      } else {
        const errorData = await response.json();
        alert("Subscription failed: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Branding Section */}
          <div>
            <h2 className="text-xl font-bold">AI Start-Up Success Chronicles</h2>
            <p className="text-sm">Inspiring AI Success Stories</p>
          </div>
          {/* Navigation Links Section */}
          <div className="flex justify-center space-x-4">
            <Link to="/contact" className="hover:underline">Contact</Link>
            <Link to="/about" className="hover:underline">About</Link>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
          {/* Newsletter Subscription Section */}
          <div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col md:flex-row items-center">
              <input
                type="email"
                value={newsletter_email}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email"
                className="p-2 rounded mb-2 md:mb-0 md:mr-2 text-black"
              />
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Subscribe
              </button>
            </form>
            {global_loading && <p className="text-xs mt-2">Loading...</p>}
          </div>
        </div>
        <div className="mt-6 border-t border-gray-700 pt-4 text-center text-sm">
          © {new Date().getFullYear()} AI Start-Up Success Chronicles. All rights reserved.
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Twitter</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
        </div>
      </footer>
    </>
  );
};

export default GV_Footer_Public;