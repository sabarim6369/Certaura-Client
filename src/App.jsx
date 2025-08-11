// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LabsPage from "./pages/LabPage";
import LabDetailsPage from "./pages/LabDetailsPage";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* <Navbar /> */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/labs" />} />
            <Route path="/labs" element={<LabsPage />} />
            <Route path="/labs/:id" element={<LabDetailsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
