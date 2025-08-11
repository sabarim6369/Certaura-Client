// src/pages/LabDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Play, Square, Clock, XCircle, ArrowLeft,
  PlusCircle, Inbox, Monitor
} from "lucide-react";

export default function LabDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const lab = state?.lab || { id, name: "Unknown Lab", description: "" };

  const [activeTab, setActiveTab] = useState("exams");
  const [exams, setExams] = useState([]);
const [devices, setDevices] = useState([
 
]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [devicesError, setDevicesError] = useState("");
  const [examUrl, setExamUrl] = useState("");

 useEffect(() => {
    if (activeTab === "devices") {
      setLoadingDevices(true);
      setDevicesError("");
      fetch(`http://localhost:3000/agent/agents/lab/${id}`) 
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setDevices(data);
        })
        .catch((err) => {
          console.error("Error fetching devices:", err);
          setDevicesError("Failed to load devices. Please try again.");
        })
        .finally(() => {
          setLoadingDevices(false);
        });
    }
  }, [activeTab, id]);

  // Auto status updater for exams
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

  const statusBadge = (status) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-700 border border-green-200";
      case "offline":
        return "bg-red-100 text-red-700 border border-red-200";
      case "locked":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      default:
        return "bg-gray-200 text-gray-600 border border-gray-300";
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100">

 <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-xl rounded-2xl p-8 mb-8 border border-gray-200">
  {/* Back Button */}
  <div className="flex items-center gap-3 mb-4">
    <button
      onClick={() => navigate("/labs")}
      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
    >
      <ArrowLeft size={18} /> Back to Labs
    </button>
  </div>

  {/* Title */}
  <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-snug">
    {lab.name}
  </h1>
  {lab.description && (
    <p className="text-lg text-gray-600 mt-2 leading-relaxed">
      {lab.description}
    </p>
  )}

  {/* Tabs */}
  <div className="flex gap-8 mt-8 border-b border-gray-300">
    {["exams", "devices"].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`pb-3 px-1 text-lg font-semibold relative transition-colors ${
          activeTab === tab
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-800"
        }`}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
        {activeTab === tab && (
          <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-600 rounded-full"></span>
        )}
      </button>
    ))}
  </div>
</div>


      {/* Exams Tab */}
      {activeTab === "exams" && (
        <>
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

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Exams in this Lab
            </h3>
            {exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-500 py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <Inbox size={40} className="mb-3 text-gray-400" />
                <p className="text-lg font-medium">No exams added yet</p>
                <p className="text-sm text-gray-400">Start by adding an exam above</p>
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
        </>
      )}

      {/* Devices Tab */}
      {activeTab === "devices" && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Monitor size={20} /> Devices in this Lab
          </h3>
      {devices.length === 0 ? (
  <div className="flex flex-col items-center justify-center text-gray-500 py-20 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200">
    <Inbox size={48} className="mb-3 text-gray-400" />
    <p className="text-lg font-medium">No devices found</p>
    <p className="text-sm text-gray-400">Connect a device to get started</p>
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {devices.map((device) => (
      <div
        key={device.deviceId}
        className="bg-gradient-to-br from-white/90 to-gray-50/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-6 
                   hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300"
      >
        {/* Device Icon */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-xl shadow-inner">
              💻
            </div>
            <h4 className="font-bold text-lg text-gray-900">
              {device.hostname || "Unnamed Device"}
            </h4>
          </div>

          {/* Glowing Status Badge */}
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
              device.status === "Active"
                ? "bg-green-100 text-green-700 border border-green-300"
                : device.status === "Offline"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-yellow-100 text-yellow-700 border border-yellow-300"
            }`}
          >
            {device.status}
          </span>
        </div>

        {/* Device Info */}
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong className="text-gray-800">Device ID:</strong> {device.deviceId}
          </p>
          <p>
            <strong className="text-gray-800">IP:</strong> {device.ip || "N/A"}
          </p>
          <p>
            <strong className="text-gray-800">Last Seen:</strong>{" "}
            {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "Never"}
          </p>
        </div>
      </div>
    ))}
  </div>
)}

        </div>
      )}
    </div>
  );
}
