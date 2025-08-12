import { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle,
  FlaskConical,
  Frown,
  RefreshCcw,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiurl from "../../api";
export default function LabsPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLabs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${apiurl}/lab/labs`);
      setLabs(res.data || []);
    } catch (err) {
      console.error("Error fetching labs:", err);
      setError("Failed to load labs. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleCreateLab = async (e) => {
    e.preventDefault();
    const newLab = {
      name: e.target.name.value,
      description: e.target.description.value || "",
    };

    try {
      const res = await axios.post(`${apiurl}/lab/addlabs`, newLab);
      const lab = res.data;
      setLabs((prev) => [...prev, lab]);
      setShowModal(false);

      const safeLabName = lab.name.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");

      const exeUrl = `${window.location.origin}/CertauraAgent.exe`;
      const exeLink = document.createElement("a");
      exeLink.href = exeUrl;
      exeLink.download = `${safeLabName}_Agent.exe`;
      document.body.appendChild(exeLink);
      exeLink.click();
      exeLink.remove();

      const batContent = `
@echo off
mkdir %USERPROFILE%\\.certauraagent 2>nul
echo { "labId": "${lab._id}" } > %USERPROFILE%\\.certauraagent\\config.json
for %%f in ("%USERPROFILE%\\Downloads\\${safeLabName}_Agent.exe") do (
  set "agent=%%~f"
  goto :found
)
echo Agent not found in Downloads folder.
pause
exit /b
:found
echo Launching agent at %agent%
start "" "%agent%"
pause
`;

      const blob = new Blob([batContent], { type: "application/octet-stream" });
      const batLink = document.createElement("a");
      batLink.href = URL.createObjectURL(blob);
      batLink.download = `launch-${safeLabName}-agent.bat`;
      document.body.appendChild(batLink);
      batLink.click();
      batLink.remove();

      alert(`Lab created. EXE & BAT file downloaded for ${lab.name}`);
    } catch (err) {
      console.error("Error adding lab:", err);
      alert("Failed to add lab. Please check server connection.");
    }
  };

  const openLabDetails = (lab) => {
    navigate(`/labs/${lab._id}`, { state: { lab } });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
    <aside className="fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col shadow-lg z-40">
    <div className="p-6 text-2xl font-bold border-b border-blue-600">
      CertAura
    </div>
    <nav className="flex-1 p-4 space-y-3">
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-3 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition w-full text-left"
      >
        <PlusCircle size={20} /> Create Lab
      </button>
      <div className="mt-6 space-y-2">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-800 w-full text-left">
          <LayoutDashboard size={20} /> Dashboard
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-800 w-full text-left">
          <Settings size={20} /> Settings
        </button>
      </div>
    </nav>
    <div className="p-4 border-t border-blue-600 text-sm text-blue-200">
      © 2025 CertAura
    </div>
  </aside>

      <main className="ml-64 flex-1 p-6 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <FlaskConical size={48} className="animate-bounce text-blue-500" />
            <p className="mt-4">Loading labs...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <Frown size={48} />
            <p className="mt-4">{error}</p>
            <button
              onClick={fetchLabs}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
            >
              <RefreshCcw size={18} /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && labs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Frown size={48} />
            <p className="mt-4">No labs found. Create your first lab!</p>
          </div>
        )}

      {/* Lab List */}
{!loading && !error && labs.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {labs.map((lab, index) => (
      <div
        key={index}
        onClick={() => openLabDetails(lab)}
        className="relative bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 cursor-pointer group overflow-hidden"
      >
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

        {/* Card Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200 transition">
              <FlaskConical className="text-blue-600 w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition">
                {lab.name}
              </h2>
              <p className="text-gray-500 text-sm line-clamp-2">{lab.description}</p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-block px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
              lab.status?.toLowerCase() === "available"
                ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                : "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
            }`}
          >
            {lab.status || "Unknown"}
          </span>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-3 bg-gray-50/70 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
          <span>Click to view details</span>
          <span className="text-blue-600 font-semibold group-hover:underline">
            → Open
          </span>
        </div>
      </div>
    ))}
  </div>
)}

      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">Create New Lab</h2>
            <form onSubmit={handleCreateLab} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Lab Name"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
