import { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, FlaskConical, Frown, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LabsPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch labs when component mounts
  const fetchLabs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3000/lab/labs");
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
    description: e.target.description.value || ""
  };

  try {
    const res = await axios.post("http://localhost:3000/lab/addlabs", newLab);
    const lab = res.data;
    setLabs((prev) => [...prev, lab]);
    setShowModal(false);

    // Sanitize lab name for filenames
    const safeLabName = lab.name.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");

    // Download EXE with lab name first
    const exeUrl = `${window.location.origin}/CertauraAgent.exe`;
    const exeLink = document.createElement("a");
    exeLink.href = exeUrl;
    exeLink.download = `${safeLabName}_Agent.exe`;  // LabName_Agent.exe
    document.body.appendChild(exeLink);
    exeLink.click();
    exeLink.remove();

    // BAT content to find EXE with new name and launch it
    const batContent = `
@echo off
:: Create config folder and write labId
mkdir %USERPROFILE%\\.certauraagent 2>nul
echo { "labId": "${lab._id}" } > %USERPROFILE%\\.certauraagent\\config.json

:: Find the EXE in Downloads folder with lab name
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

    // Download BAT file named accordingly
    const blob = new Blob([batContent], { type: "application/octet-stream" });
    const batLink = document.createElement("a");
    batLink.href = URL.createObjectURL(blob);
    batLink.download = `launch-${safeLabName}-agent.bat`; // launch-LabName-agent.bat
    document.body.appendChild(batLink);
    batLink.click();
    batLink.remove();

    alert(`Lab created. EXE & BAT file downloaded for ${lab.name}`);
  } catch (err) {
    console.error("Error adding lab:", err);
    alert("Failed to add lab. Please check server connection.");
  }
};






  const openLabDetails = (lab, index) => {
    navigate(`/labs/${lab._id}`, { state: { lab } });
  };

  return (
    <div className="h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">CertAura</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition cursor-pointer"
        >
          <PlusCircle size={20} /> Create Lab
        </button>
      </div>

      {/* Loading State */}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {labs.map((lab, index) => (
            <div
              key={index}
              onClick={() => openLabDetails(lab, index)}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-200 cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-50 group-hover:bg-blue-100 transition">
                  <FlaskConical className="text-blue-600 w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {lab.name}
                  </h2>
                  <p className="text-gray-500 text-sm">{lab.description}</p>
                </div>
              </div>
              <span
                className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${
                  lab.status?.toLowerCase() === "available"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {lab.status || "Unknown"}
              </span>
            </div>
          ))}
        </div>
      )}

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
