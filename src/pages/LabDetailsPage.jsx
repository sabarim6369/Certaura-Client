// src/pages/LabDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Play,
  Square,
  Clock,
  XCircle,
  ArrowLeft,
  PlusCircle,
  Inbox,
} from "lucide-react";

export default function LabDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const lab = state?.lab || { id, name: "Unknown Lab", description: "" };

  const [exams, setExams] = useState([]);
  const [examUrl, setExamUrl] = useState("");

  // Auto status updater
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setExams((prev) =>
        prev.map((exam) => {
          if (exam.autoMode && exam.autoOnTime && exam.autoOffTime) {
            const start = new Date(exam.autoOnTime);
            const end = new Date(exam.autoOffTime);
            if (now >= start && now <= end) {
              return { ...exam, status: "Ongoing" };
            } else if (exam.status === "Ongoing") {
              return { ...exam, status: "Stopped" };
            }
          }
          return exam;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addExam = () => {
    if (!examUrl.trim()) return;
    setExams([
      ...exams,
      {
        id: Date.now(),
        url: examUrl,
        status: "Stopped",
        autoMode: false,
        autoOnTime: "",
        autoOffTime: "",
      },
    ]);
    setExamUrl("");
  };

  const removeExam = (examId) => {
    setExams(exams.filter((exam) => exam.id !== examId));
  };

  const toggleStatus = (examId) => {
    setExams(
      exams.map((exam) =>
        exam.id === examId
          ? {
              ...exam,
              status:
                exam.status === "Running" || exam.status === "Ongoing"
                  ? "Stopped"
                  : "Running",
            }
          : exam
      )
    );
  };

  const toggleAutoMode = (examId) => {
    setExams(
      exams.map((exam) =>
        exam.id === examId
          ? {
              ...exam,
              autoMode: !exam.autoMode,
              autoOnTime: "",
              autoOffTime: "",
            }
          : exam
      )
    );
  };

  const updateTimer = (examId, type, value) => {
    setExams(
      exams.map((exam) =>
        exam.id === examId ? { ...exam, [type]: value } : exam
      )
    );
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Top Bar */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => navigate("/labs")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium"
          >
            <ArrowLeft size={18} /> Back to Labs
          </button>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900">{lab.name}</h1>
        {lab.description && (
          <p className="text-gray-500 mt-1">{lab.description}</p>
        )}
      </div>

      {/* Create Exam Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
          <PlusCircle size={20} className="text-green-600" /> Create New Exam
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="border border-gray-300 p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Exam URL (e.g., https://skillrack.com)"
            value={examUrl}
            onChange={(e) => setExamUrl(e.target.value)}
          />
          <button
            onClick={addExam}
            className="bg-green-600 hover:bg-green-700 transition text-white px-6 py-3 rounded-lg shadow font-medium"
          >
            Add Exam
          </button>
        </div>
      </div>

      {/* Exams Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Exams in this Lab
        </h3>
        {exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <Inbox size={40} className="mb-3 text-gray-400" />
            <p className="text-lg font-medium">No exams added yet</p>
            <p className="text-sm text-gray-400">
              Start by adding an exam above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 flex flex-col gap-4 transition transform hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold break-all text-gray-900 text-sm">
                    {exam.url}
                  </span>
                  <button
                    onClick={() => removeExam(exam.id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                      exam.status === "Running"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : exam.status === "Ongoing"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-200 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {exam.status}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleStatus(exam.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition shadow ${
                      exam.status === "Running" || exam.status === "Ongoing"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {exam.status === "Running" || exam.status === "Ongoing" ? (
                      <>
                        <Square size={16} /> Stop
                      </>
                    ) : (
                      <>
                        <Play size={16} /> Start
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleAutoMode(exam.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition border ${
                      exam.autoMode
                        ? "bg-yellow-50 text-yellow-700 border-yellow-300 shadow-sm"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                  >
                    <Clock size={16} />
                    {exam.autoMode ? "Auto: ON" : "Auto: OFF"}
                  </button>
                </div>

                {/* Auto Timer Inputs */}
                {exam.autoMode && (
                  <div className="flex flex-col gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 font-medium w-24">
                        Auto ON
                      </label>
                      <input
                        type="datetime-local"
                        value={exam.autoOnTime}
                        onChange={(e) =>
                          updateTimer(exam.id, "autoOnTime", e.target.value)
                        }
                        className="border border-gray-300 rounded-lg p-2 flex-1 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 font-medium w-24">
                        Auto OFF
                      </label>
                      <input
                        type="datetime-local"
                        value={exam.autoOffTime}
                        onChange={(e) =>
                          updateTimer(exam.id, "autoOffTime", e.target.value)
                        }
                        className="border border-gray-300 rounded-lg p-2 flex-1 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
