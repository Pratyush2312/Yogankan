import { useState } from "react";
import toast from "react-hot-toast";


const URL = import.meta.env.VITE_BACKEND_URL
const categories = [
  "accuracy",
  "stability",
  "holdDuration",
  "aestheticFlow",
  "facialExpression",
  "breathControl",
  "mindfulness",
  "sequence",
  "yogicComposure",
  "dressCode",
  "overallPerformance"
];
const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

const Edit = () => {
  const judges = ["J1", "J2", "J3", "J4", "J5"];

  const [group, setGroup] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selectedJudge, setSelectedJudge] = useState("J1");
  const [poseIndex, setPoseIndex] = useState(0);

  const [editedPose, setEditedPose] = useState({
    accuracy: "",
    stability: "",
    holdDuration: "",
    aestheticFlow: "",
    facialExpression: "",
    breathControl: "",
    mindfulness: "",
    sequence:"",
    yogicComposure: "",
    dressCode: "",
    overallPerformance: ""
  });

  const handleChange = (field, value) => {
    setEditedPose(prev => ({
      ...prev,
      [field]: Number(value)
    }));
  };

  const handleSave = async () => {
    const payload = {
      judgeId: selectedJudge,
      studentId: Number(studentId),
      group,
      poseIndex,
      updatedPose: editedPose
    };

    try {
      const res = await fetch(`${URL}/admin/update`, {
        method: "PUT",
        credentials:"include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.status === "success") {
        toast.success("Pose updated successfully!");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Server error while updating");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF3E0] to-[#E8F5E9]">
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-lg">

        <h2 className="text-3xl font-serif text-center text-[#4CAF50] mb-6">
          Edit Pose Scores
        </h2>

        <div className="flex flex-col gap-4">
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="rounded-full px-4 py-2 border"
          >
            <option value="">Select Group</option>
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="rounded-full px-4 py-2 border"
          />

          <select
            value={selectedJudge}
            onChange={(e) => setSelectedJudge(e.target.value)}
            className="rounded-full px-4 py-2 border"
          >
            {judges.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>

          <select
            value={poseIndex}
            onChange={(e) => setPoseIndex(Number(e.target.value))}
            className="rounded-full px-4 py-2 border"
          >
            {[0, 1, 2, 3, 4].map(i => (
              <option key={i} value={i}>Pose {i + 1}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => (
              <div key={cat}>
                <label className="text-sm text-green-700 capitalize">{cat}</label>
                <input
                  type="number"
                  value={editedPose[cat]}
                  onChange={(e) => handleChange(cat, e.target.value)}
                  className="w-full rounded-xl px-3 py-1 border"
                />
              </div>
            ))}
          </div>

          <button
            className="mt-4 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white py-3 rounded-full shadow-lg hover:scale-105 transition"
            onClick={handleSave}
          >
            Save Pose
          </button>

        </div>
      </div>
    </div>
  );
};

export default Edit;
