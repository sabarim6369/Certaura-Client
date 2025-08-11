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
  Monitor,
} from "lucide-react";
import axios from "axios";

export default function LabDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const lab = state?.lab || { id, name: "Unknown Lab", description: "" };

  const [activeTab, setActiveTab] = useState("exams");
  const [exams, setExams] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [devicesError, setDevicesError] = useState("");
  
  // Modal state for adding exam
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExamUrl, setNewExamUrl] = useState("");
  const [newExamName, setNewExamName] = useState("");
  const [addingExam, setAddingExam] = useState(false);


  useEffect(() => {
    // Fetch exams for the lab on mount or id change
    const fetchExams = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/exams?labId=${id}`);
        setExams(res.data);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      }
    };
    fetchExams();
  }, [id]);

  useEffect(() => {
    if (activeTab === "devices") {
      setLoadingDevices(true);
      setDevicesError("");
      fetch(`http://localhost:3000/agent/agents/lab/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => setDevices(data))
        .catch((err) => {
          console.error("Error fetching devices:", err);
          setDevicesError("Failed to load devices. Please try again.");
        })
        .finally(() => setLoadingDevices(false));
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

 const addExam = async () => {
  if (!newExamName.trim() || !newExamUrl.trim()) return;

  setAddingExam(true);
  try {
    const payload = {
      name: newExamName.trim(),
      url: newExamUrl.trim(),
      status: "Stopped",
      autoMode: false,
      autoOnTime: "",
      autoOffTime: "",
      labId: id,
    };

    const response = await axios.post("http://localhost:3000/exams", payload);
    const newExam = response.data;

    setExams((prevExams) => [
      ...prevExams,
      {
        id: newExam._id,
        name: newExam.name,
        url: newExam.url,
        status: newExam.status,
        autoMode: newExam.autoMode,
        autoOnTime: newExam.autoOnTime,
        autoOffTime: newExam.autoOffTime,
      },
    ]);

    setNewExamName("");
    setNewExamUrl("");
    setShowAddExamModal(false);
  } catch (error) {
    console.error("Failed to add exam:", error);
  } finally {
    setAddingExam(false);
  }
};

  const removeExam = async (examId) => {
    try {
      await axios.delete(`http://localhost:3000/exams/${examId}`);
      setExams(exams.filter((exam) => exam.id !== examId));
    } catch (error) {
      console.error("Failed to delete exam:", error);
      // optionally show user error message
    }
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
      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-xl rounded-2xl p-8 mb-8 border border-gray-200">
        {/* Back Button */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/labs")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg cursor-pointer"
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
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              Exams in this Lab
            </h3>
            <button
              onClick={() => setShowAddExamModal(true)}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition"
            >
              <PlusCircle size={20} /> Create New Exam
            </button>
          </div>

          {exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <Inbox size={40} className="mb-3 text-gray-400" />
              <p className="text-lg font-medium">No exams added yet</p>
              <p className="text-sm text-gray-400">
                Click "Create New Exam" to add one
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
                    <div>
  <p className="font-semibold text-gray-900">{exam.name}</p>
  <p className="text-sm break-all text-gray-600">{exam.url}</p>
</div>

                    <button
                      onClick={() => removeExam(exam.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Remove Exam"
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

          {/* Add Exam Modal */}
         {/* Add Exam Modal */}
{showAddExamModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md mx-4 relative">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Exam
      </h2>

      <label htmlFor="examNameInput" className="block mb-2 font-semibold text-gray-700">
        Exam Name
      </label>
      <input
        id="examNameInput"
        type="text"
        placeholder="Enter Exam Name"
        value={newExamName}
        onChange={(e) => setNewExamName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label htmlFor="examUrlInput" className="block mb-2 font-semibold text-gray-700">
        Exam URL
      </label>
      <input
        id="examUrlInput"
        type="text"
        placeholder="Enter Exam URL"
        value={newExamUrl}
        onChange={(e) => setNewExamUrl(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowAddExamModal(false)}
          className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          disabled={addingExam}
        >
          Cancel
        </button>
        <button
          onClick={addExam}
          disabled={addingExam || !newExamName.trim() || !newExamUrl.trim()}
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
        >
          {addingExam ? "Adding..." : "Add Exam"}
        </button>
      </div>

      {/* Close modal button */}
      <button
        onClick={() => setShowAddExamModal(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        aria-label="Close modal"
      >
        <XCircle size={24} />
      </button>
    </div>
  </div>
)}

        </>
      )}

      {/* Devices Tab */}
      {activeTab === "devices" && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Monitor size={20} /> Devices in this Lab
          </h3>
          {loadingDevices ? (
            <p className="text-gray-600">Loading devices...</p>
          ) : devicesError ? (
            <p className="text-red-500">{devicesError}</p>
          ) : devices.length === 0 ? (
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
                  className="bg-gradient-to-br from-white/90 to-gray-50/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-3 rounded-xl shadow-inner">💻</div>
                      <h4 className="font-bold text-lg text-gray-900">
                        {device.hostname || "Unnamed Device"}
                      </h4>
                    </div>
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

                  <div className="text-sm text-gray-600 space-y-2">
                    <p>
                      <strong className="text-gray-800">Device ID:</strong> {device.deviceId}
                    </p>
                    <p>
                      <strong className="text-gray-800">IP:</strong> {device.ip || "N/A"}
                    </p>
                    <p>
                      <strong className="text-gray-800">Last Seen:</strong>{" "}
                      {device.lastSeen
                        ? new Date(device.lastSeen).toLocaleString()
                        : "Never"}
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
