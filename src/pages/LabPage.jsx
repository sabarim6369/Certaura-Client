import { useState } from "react";
import { PlusCircle, FlaskConical, Monitor, Beaker } from "lucide-react"; 
import { useNavigate } from "react-router-dom"; // ✅ Import navigation

export default function LabsPage() {
  const navigate = useNavigate(); // ✅ Hook for navigation
  const [showModal, setShowModal] = useState(false);
  const [labs, setLabs] = useState([
    { name: "Physics Lab", type: "Physics", capacity: 30, status: "Available", description: "Experiments with motion, forces, and energy." },
    { name: "Computer Lab", type: "Computer", capacity: 25, status: "Occupied", description: "Programming, simulations, and computational experiments." }
  ]);

  const getLabIcon = (type) => {
    switch (type) {
      case "Physics": return <FlaskConical className="text-blue-500 w-8 h-8" />;
      case "Chemistry": return <Beaker className="text-green-500 w-8 h-8" />;
      case "Computer": return <Monitor className="text-purple-500 w-8 h-8" />;
      default: return <FlaskConical className="text-gray-500 w-8 h-8" />;
    }
  };

  const handleCreateLab = (e) => {
    e.preventDefault();
    const newLab = {
      name: e.target.name.value,
      type: e.target.type.value,
      capacity: e.target.capacity.value,
      status: "Available",
      description: e.target.description.value || ""
    };
    setLabs([...labs, newLab]);
    setShowModal(false);
  };

  const openLabDetails = (lab, index) => {
    navigate(`/labs/${index}`, { state: { lab } }); // ✅ Pass lab data to details page
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">CertAura</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <PlusCircle size={20} /> Create Lab
        </button>
      </div>

      {/* Lab List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {labs.map((lab, index) => (
          <div
            key={index}
            onClick={() => openLabDetails(lab, index)} // ✅ Click to navigate
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border border-gray-100 cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              {getLabIcon(lab.type)}
              <div>
                <h2 className="text-xl font-semibold">{lab.name}</h2>
                <p className="text-gray-500">{lab.type} Lab</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`px-3 py-1 text-sm rounded-full font-medium ${
                  lab.status === "Available"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {lab.status}
              </span>
              <span className="text-gray-500 text-sm">
                Capacity: {lab.capacity}
              </span>
            </div>
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
              <select
                name="type"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Lab Type</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Computer">Computer</option>
              </select>
              <input
                name="capacity"
                type="number"
                placeholder="Capacity"
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
