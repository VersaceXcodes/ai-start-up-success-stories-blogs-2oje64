import React from "react";

const GV_AdminFooter: React.FC = () => {
  return (
    <>
      <footer className="w-full bg-gray-100 py-4 text-center text-sm text-gray-600 border-t">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} AI Start-Up Success Chronicles. All rights reserved.</p>
          <p>
            For support, contact{" "}
            <a href="mailto:support@example.com" className="text-blue-500 hover:underline">
              support@example.com
            </a>
          </p>
        </div>
      </footer>
    </>
  );
};

export default GV_AdminFooter;