// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <Link to="/labs" className="text-xl font-bold text-blue-600">Lab Manager</Link>
      <div className="space-x-6">
        <Link
          to="/labs"
          className={`hover:text-blue-600 ${pathname.startsWith("/labs") ? "text-blue-600 font-semibold" : "text-gray-600"}`}
        >
          Labs
        </Link>
      </div>
    </nav>
  );
}
