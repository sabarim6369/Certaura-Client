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
  Edit2,
  Check,
  X,
} from "lucide-react";
import axios from "axios";

export default function LabDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialLab = state?.lab || { id, name: "Unknown Lab", description: "" };

  const [lab, setLab] = useState(initialLab);
  const [isEditingLab, setIsEditingLab] = useState(false);
  const [labEditName, setLabEditName] = useState(lab.name);
  const [labEditDescription, setLabEditDescription] = useState(lab.description);

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

  // Track which exam is editing (by id)
  const [editingExamId, setEditingExamId] = useState(null);
  // Temporary exam edit fields
  const [examEditName, setExamEditName] = useState("");
  const [examEditUrl, setExamEditUrl] = useState("");

  // For editing auto start times per exam
  const [editingAutoId, setEditingAutoId] = useState(null);

  // Fetch exams for this lab
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/exams?labId=${id}`);
        const examsWithId = res.data.map((exam) => ({
          id: exam._id || exam.id,
          ...exam,
        }));
        setExams(examsWithId);
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

  const startEditingLab = () => {
    setLabEditName(lab.name);
    setLabEditDescription(lab.description);
    setIsEditingLab(true);
  };

  const cancelEditingLab = () => {
    setIsEditingLab(false);
  };

  const saveLabEdits = async () => {
    try {
      await axios.put(`http://localhost:3000/lab/labs/${lab._id}`, {
        name: labEditName.trim(),
        description: labEditDescription.trim(),
      });
      setLab({ ...lab, name: labEditName.trim(), description: labEditDescription.trim() });
      setIsEditingLab(false);
    } catch (error) {
      console.error("Failed to save lab edits:", error);
      alert("Failed to save lab changes.");
    }
  };

  // Exam editing handlers
  const startEditingExam = (exam) => {
    setEditingExamId(exam.id);
    setExamEditName(exam.name);
    setExamEditUrl(exam.url);
  };

  const cancelEditingExam = () => {
    setEditingExamId(null);
  };

  const saveExamEdits = async (examId) => {
    if (!examEditName.trim() || !examEditUrl.trim()) {
      alert("Exam name and URL cannot be empty.");
      return;
    }
    try {
      const response = await axios.put(`http://localhost:3000/exams/${examId}`, {
        name: examEditName.trim(),
        url: examEditUrl.trim(),
      });
      const updatedExam = response.data;
      setExams((prev) =>
        prev.map((e) => (e.id === examId ? { ...e, ...updatedExam } : e))
      );
      setEditingExamId(null);
    } catch (error) {
      console.error("Failed to save exam edits:", error);
      alert("Failed to save exam changes.");
    }
  };

  // Confirm before deleting exam
  const removeExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    try {
      await axios.delete(`http://localhost:3000/exams/${examId}`);
      setExams(exams.filter((exam) => exam.id !== examId));
    } catch (error) {
      console.error("Failed to delete exam:", error);
      alert("Failed to delete exam.");
    }
  };

  const toggleStatus = async (examId) => {
    try {
      const exam = exams.find((e) => e.id === examId);
      if (!exam) return;

      const newStatus =
        exam.status === "Running" || exam.status === "Ongoing" ? "Stopped" : "Running";

      const confirmMsg =
        newStatus === "Running"
          ? "Are you sure you want to start this exam?"
          : "Are you sure you want to stop this exam?";

      if (!window.confirm(confirmMsg)) return;

      const response = await axios.put(`http://localhost:3000/exams/${examId}`, {
        status: newStatus,
      });

      const updatedExam = response.data;
      setExams((prev) =>
        prev.map((e) => (e.id === examId ? { ...e, ...updatedExam } : e))
      );
    } catch (error) {
      console.error("Failed to toggle status:", error);
      alert("Failed to change exam status.");
    }
  };

  const toggleAutoMode = async (examId) => {
    try {
      const exam = exams.find((e) => e.id === examId);
      if (!exam) return;

      const newAutoMode = !exam.autoMode;

      const confirmMsg = newAutoMode
        ? "Are you sure you want to enable Auto Mode?"
        : "Are you sure you want to disable Auto Mode?";

      if (!window.confirm(confirmMsg)) return;

      const payload = {
        autoMode: newAutoMode,
        autoOnTime: newAutoMode ? exam.autoOnTime : "",
        autoOffTime: newAutoMode ? exam.autoOffTime : "",
      };

      const response = await axios.put(`http://localhost:3000/exams/${examId}`, payload);
      const updatedExam = response.data;

      setExams((prev) =>
        prev.map((e) => (e.id === examId ? { ...e, ...updatedExam } : e))
      );
    } catch (error) {
      console.error("Failed to toggle auto mode:", error);
      alert("Failed to change auto mode.");
    }
  };

  const enableAutoStart = (examId) => {
    const nowISO = new Date().toISOString().slice(0, 16);
    const plusOneHour = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
    const plusTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);

    setExams(
      exams.map((exam) =>
        exam.id === examId
          ? {
              ...exam,
              autoMode: true,
              autoOnTime: nowISO,
              autoOffTime: plusOneHour,
              _autoOnTimeTemp: nowISO,
              _autoOffTimeTemp: plusTwoHours,
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

  const saveAutoMode = async (examId) => {
    const examToUpdate = exams.find((exam) => exam.id === examId);
    if (!examToUpdate) return;

    try {
      const response = await axios.put(`http://localhost:3000/exams/${examId}`, {
        autoMode: true,
        autoOnTime: examToUpdate.autoOnTime,
        autoOffTime: examToUpdate.autoOffTime,
      });

      const updatedExam = response.data;

      setExams((prev) =>
        prev.map((exam) => (exam.id === examId ? { ...exam, ...updatedExam } : exam))
      );
    } catch (error) {
      console.error("Failed to save auto mode:", error);
      alert("Failed to save auto mode.");
    }
  };

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
      alert("Failed to add exam.");
    } finally {
      setAddingExam(false);
    }
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

        {/* Lab Title and Description with edit */}
        <div className="flex items-center gap-4">
          {isEditingLab ? (
            <>
              <input
                type="text"
                value={labEditName}
                onChange={(e) => setLabEditName(e.target.value)}
                className="text-4xl font-black text-gray-900 tracking-tight leading-snug border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveLabEdits}
                  className="text-green-600 hover:text-green-800"
                  title="Save"
                >
                  <Check size={28} />
                </button>
                <button
                  onClick={cancelEditingLab}
                  className="text-red-600 hover:text-red-800"
                  title="Cancel"
                >
                  <X size={28} />
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-snug flex-1">
                {lab.name}
              </h1>
              <button
                onClick={startEditingLab}
                className="text-gray-500 hover:text-gray-700 transition"
                title="Edit Lab Name & Description"
              >
                <Edit2 size={24} />
              </button>
            </>
          )}
        </div>

        {/* Lab Description */}
        <div className="mt-2">
          {isEditingLab ? (
            <textarea
              value={labEditDescription}
              onChange={(e) => setLabEditDescription(e.target.value)}
              rows={3}
              className="w-full text-lg text-gray-600 leading-relaxed border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Enter lab description"
            />
          ) : (
            lab.description && (
              <p className="text-lg text-gray-600 leading-relaxed">{lab.description}</p>
            )
          )}
        </div>

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
                    {editingExamId === exam.id ? (
                      <div className="flex flex-col flex-1 gap-2">
                        <input
                          type="text"
                          value={examEditName}
                          onChange={(e) => setExamEditName(e.target.value)}
                          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Exam Name"
                        />
                        <input
                          type="text"
                          value={examEditUrl}
                          onChange={(e) => setExamEditUrl(e.target.value)}
                          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Exam URL"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col flex-1">
                        <p className="font-semibold text-gray-900">{exam.name}</p>
                        <p className="text-sm break-all text-gray-600">{exam.url}</p>
                      </div>
                    )}

                    <div className="flex gap-2 ml-4">
                      {editingExamId === exam.id ? (
                        <>
                          <button
                            onClick={() => saveExamEdits(exam.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Save Exam"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={cancelEditingExam}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel Edit"
                          >
                            <X size={20} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditingExam(exam)}
                            className="text-gray-500 hover:text-gray-700"
                            title="Edit Exam"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => removeExam(exam.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Exam"
                          >
                            <XCircle size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer select-none
                        ${
                          exam.status === "Running" || exam.status === "Ongoing"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      onClick={() => toggleStatus(exam.id)}
                      title="Toggle Exam Status"
                    >
                      {exam.status === "Running" || exam.status === "Ongoing" ? (
                        <Play size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                      <span>{exam.status}</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer select-none
                        ${exam.autoMode ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}
                      onClick={() => toggleAutoMode(exam.id)}
                      title="Toggle Auto Mode"
                    >
                      <Clock size={16} />
                      <span>Auto Mode</span>
                    </div>
                  </div>

                  {exam.autoMode && (
                    <div className="mt-2">
                      {editingAutoId === exam.id ? (
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-gray-600">
                            Auto On Time
                            <input
                              type="datetime-local"
                              value={exam.autoOnTime || ""}
                              onChange={(e) => updateTimer(exam.id, "autoOnTime", e.target.value)}
                              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </label>
                          <label className="text-sm text-gray-600">
                            Auto Off Time
                            <input
                              type="datetime-local"
                              value={exam.autoOffTime || ""}
                              onChange={(e) => updateTimer(exam.id, "autoOffTime", e.target.value)}
                              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </label>

                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                saveAutoMode(exam.id);
                                setEditingAutoId(null);
                              }}
                              className="text-green-600 hover:text-green-800 font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingAutoId(null)}
                              className="text-red-600 hover:text-red-800 font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => enableAutoStart(exam.id)}
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Enable Auto Start (Now)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="text-sm text-blue-600 underline cursor-pointer"
                          onClick={() => setEditingAutoId(exam.id)}
                          title="Edit Auto Mode Timers"
                        >
                          Auto Start: {exam.autoOnTime?.replace("T", " ") || "-"} | Auto End:{" "}
                          {exam.autoOffTime?.replace("T", " ") || "-"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Exam Modal */}
          {showAddExamModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-6 w-[400px] max-w-full">
                <h3 className="text-xl font-semibold mb-4">Create New Exam</h3>
                <input
                  type="text"
                  placeholder="Exam Name"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Exam URL"
                  value={newExamUrl}
                  onChange={(e) => setNewExamUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowAddExamModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addExam}
                    disabled={addingExam}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {addingExam ? "Adding..." : "Add Exam"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

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
