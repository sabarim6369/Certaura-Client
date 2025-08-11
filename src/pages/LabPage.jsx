import { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LabsPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [labs, setLabs] = useState([]);

  // ✅ Fetch labs when component mounts
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await axios.get("http://localhost:3000/lab/labs");
        setLabs(res.data);
      } catch (err) {
        console.error("Error fetching labs:", err);
        alert("Failed to load labs. Please check server connection.");
      }
    };

    fetchLabs();
  }, []);

  const handleCreateLab = async (e) => {
    e.preventDefault();
    const newLab = {
      name: e.target.name.value,
      description: e.target.description.value || ""
      // ❌ Don't send status — let backend default handle it
    };

    try {
      const res = await axios.post("http://localhost:3000/lab/addlabs", newLab);
      setLabs([...labs, res.data]);
      setShowModal(false);
    } catch (err) {
      console.error("Error adding lab:", err);
      alert("Failed to add lab. Please check server connection.");
    }
  };

  const openLabDetails = (lab, index) => {
    navigate(`/labs/${index}`, { state: { lab } });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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

      {/* Lab List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {labs.map((lab, index) => (
          <div
            key={index}
            onClick={() => openLabDetails(lab, index)}
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border border-gray-100 cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <FlaskConical className="text-blue-500 w-8 h-8" />
              <div>
                <h2 className="text-xl font-semibold">{lab.name}</h2>
                <p className="text-gray-500">{lab.description}</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded-full font-medium ${
                lab.status?.toLowerCase() === "available"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {lab.status}
            </span>
          </div>
        ))}
      </div>

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
