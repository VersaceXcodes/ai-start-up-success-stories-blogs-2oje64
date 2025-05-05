import React from "react";
import { Link } from "react-router-dom";

const UV_About: React.FC = () => {
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Banner Image Section */}
        <div className="mb-8">
          <img
            src="https://picsum.photos/1200/400?random=about"
            alt="About Banner"
            className="w-full object-cover rounded-lg"
          />
        </div>

        {/* Main Title and Introduction */}
        <h1 className="text-4xl font-bold text-center mb-4">
          About AI Start-Up Success Chronicles
        </h1>
        <p className="text-lg text-gray-700 mb-6 text-center">
          Celebrating innovation and inspiring the future of AI startups.
        </p>

        {/* Our Mission Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
          <p className="text-base text-gray-700 leading-relaxed">
            At AI Start-Up Success Chronicles, our mission is to curate and share authentic stories of innovation, growth, and success from AI-driven startups around the globe. We believe in fostering an environment where inspiration meets practicality, and where entrepreneurs find the guidance they need to transform ideas into groundbreaking realities.
          </p>
        </section>

        {/* Our Values Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Our Values</h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>Innovation: Embracing the cutting-edge advances in AI technology.</li>
            <li>Integrity: Transparency and trust at the heart of every story we share.</li>
            <li>Community: Building connections among visionary entrepreneurs and enthusiasts.</li>
            <li>Empowerment: Inspiring startups to achieve their full potential.</li>
          </ul>
        </section>

        {/* Our Journey Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Our Journey</h2>
          <p className="text-base text-gray-700 leading-relaxed">
            Born out of a passion for technology and a belief in the transformative power of AI innovations, we started this platform to document the remarkable journeys of startups that redefine the future. Each story is a testament to resilience, creativity, and the drive to push boundaries.
          </p>
          <div className="mt-4">
            <img
              src="https://picsum.photos/800/400?random=success"
              alt="AI Startup Journey"
              className="w-full object-cover rounded-lg"
            />
          </div>
        </section>

        {/* Multimedia Section: Embedded Video */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Watch Our Story</h2>
          <div className="relative pb-[56.25%] overflow-hidden rounded-lg">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Our Story Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        {/* Navigation Link to Return Home */}
        <div className="text-center mt-10">
          <Link to="/" className="text-blue-500 hover:underline">
            Return to Homepage
          </Link>
        </div>
      </div>
    </>
  );
};

export default UV_About;