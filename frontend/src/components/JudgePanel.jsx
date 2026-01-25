import toast from 'react-hot-toast';
import { useState } from 'react'
import { useParams } from 'react-router'
import PageWrapper from './PageWrapper'
import Logout from './Logout';

const URL = import.meta.env.VITE_BACKEND_URL

const categories = [
  { key: "accuracy", label: "Accuracy & Alignment (20)" },
  { key: "stability", label: "Stability (10)" },
  { key: "holdDuration", label: "Hold Duration (10)" },
  { key: "aestheticFlow", label: "Aesthetic Flow (10)" },
  { key: "facialExpression", label: "Facial Expression (5)" },
  { key: "breathControl", label: "Breath Control (5)" },
  { key: "mindfulness", label: "Mindfulness / Focus (5)" },
  { key: "sequence", label: "Sequence (10)" },
  { key: "yogicComposure", label: "Yogic Composure (10)" },
  { key: "dressCode", label: "Discipline & Dress Code (5)" },
  { key: "overallPerformance", label: "Overall Performance (10)" }
];

const TOTAL_POSES = 5;
const grp = ["A","B","C","D","E","F","G","H","I"];

const JudgePanel = () => {
  const { judgeId } = useParams();
  const [group, setGroup] = useState("");
  const [studentId, setStudentId] = useState("");
  const [poseIndex, setPoseIndex] = useState(0);

  const emptyPoseScore = categories.reduce((acc, c) => ({ ...acc, [c.key]: "" }), {});
  const [scores, setScores] = useState(Array(TOTAL_POSES).fill().map(() => ({ ...emptyPoseScore })));
  const [dropflag, setDropflag] = useState(Array(TOTAL_POSES).fill(false));

  const updateScore = (category, value) => {
    const updated = [...scores];
    updated[poseIndex][category] = value === "" ? "" : Number(value);
    setScores(updated);
  };

  const getPoseTotal = (i) => {
    return Object.values(scores[i]).reduce((sum, v) => sum + (Number(v) || 0), 0);
  };

  const handleDrop = (checked) => {
    const newDrops = [...dropflag];
    newDrops[poseIndex] = checked;
    setDropflag(newDrops);

    if (checked) {
      const updated = [...scores];
      Object.keys(updated[poseIndex]).forEach(k => updated[poseIndex][k] = 0);
      setScores(updated);
      toast.error(`Pose ${poseIndex + 1} marked as DROP. All scores set to 0`);
    }
  };

  const handleNext = () => {
    for (let cat of categories) {
      if (!dropflag[poseIndex] && scores[poseIndex][cat.key] === "") {
        toast.error(`Please fill ${cat.label}`);
        return;
      }
    }
    setPoseIndex(poseIndex + 1);
  };

  const handleSubmit = async () => {
    for (let p = 0; p < TOTAL_POSES; p++) {
      for (let cat of categories) {
        if (!dropflag[p] && scores[p][cat.key] === "") {
          toast.error(`Pose ${p + 1}: ${cat.label} missing`);
          return;
        }
      }
    }
    if (!group) {
      toast.error("Please select group");
      return;
    }

    const payload = {
      studentId,
      group,
      poseScores: scores.map((pose, i) => ({
        ...pose,
        drop: dropflag[i],
        total: dropflag[i] ? 0 : getPoseTotal(i)
      }))
    };

    try {
      const res = await fetch(`${URL}/submitscore`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.status === "duplicate") {
        toast.error(data.message);
        return;
      }

      if (data.status === "success") {
        toast.success("Score submitted successfully 🧘‍♂️");
        setPoseIndex(0);
        setStudentId("");
        setScores(Array(TOTAL_POSES).fill().map(() => ({ ...emptyPoseScore })));
        setDropflag(Array(TOTAL_POSES).fill(false));
      }
    } catch (err) {
      toast.error("Backend error");
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen p-6 bg-[#FAF3E0]">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-4">Judge Panel</h1>

        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-xl">Welcome Judge {judgeId}</h2>
          <Logout />
        </div>

        <div className="flex gap-4 mb-4">
          <select value={group} onChange={e => setGroup(e.target.value)} className="border p-2 rounded">
            <option value="">Select Group</option>
            {grp.map(g => <option key={g}>{g}</option>)}
          </select>

          <input
            type="number"
            placeholder="Student ID"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            className="border p-2 rounded w-32"
          />

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={dropflag[poseIndex]} onChange={e => handleDrop(e.target.checked)} />
            Drop: {dropflag[poseIndex] ? "Yes" : "No"}
          </label>
        </div>

        <h3 className="font-bold text-lg mb-2">Pose {poseIndex + 1}</h3>

        <div className="bg-white p-4 rounded shadow space-y-2">
          {categories.map(cat => (
            <div key={cat.key} className="flex justify-between items-center">
              <span>{cat.label}</span>
              <input
                type="number"
                className="border p-1 w-20 text-center"
                value={scores[poseIndex][cat.key]}
                onChange={e => updateScore(cat.key, e.target.value)}
                disabled={dropflag[poseIndex]}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 font-bold">Total: {dropflag[poseIndex] ? 0 : getPoseTotal(poseIndex)}</div>

        <div className="mt-4">
          {poseIndex < TOTAL_POSES - 1 ? (
            <button onClick={handleNext} className="bg-green-600 text-white px-6 py-2 rounded">Next</button>
          ) : (
            <button onClick={handleSubmit} className="bg-green-600 text-white px-6 py-2 rounded">Submit</button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default JudgePanel;
