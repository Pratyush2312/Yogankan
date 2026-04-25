import toast from 'react-hot-toast';
import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import PageWrapper from './PageWrapper'
import Logout from './Logout';
import { MdArrowBack } from "react-icons/md";
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
const STUDENTS = 5;
const grp = ["A", "B", "C", "D", "E", "F", "G", "H","P"]
const emptyScore = categories.reduce((a, c) => ({ ...a, [c.key]: "" }), {});

const JudgePanel = () => {
  const { judgeId } = useParams();
  const [group, setGroup] = useState();
  const [pose, setPose] = useState(0);

  const [studentIds, setStudentIds] = useState([""]);
  const [scores, setScores] = useState(
    Array(TOTAL_POSES).fill().map(() => [
      { ...emptyScore }
    ])
  );

  const [drops, setDrops] = useState(
    Array(TOTAL_POSES).fill().map(() => [false])
  );

  const updateScore = (student, cat, val) => {
    const updated = [...scores];
    updated[pose][student][cat] = val === "" ? "" : Number(val);
    setScores(updated);
  };

  const handleDrop = (student, checked) => {
    const d = [...drops];
    d[pose][student] = checked;

    if (checked) {
      Object.keys(scores[pose][student]).forEach(k => scores[pose][student][k] = 0);
      setScores([...scores]);
    }
    setDrops(d);
  };

  const prevPose = () => {
    if (pose > 0) {
      setPose(pose - 1);
    }
  };

  const validatePose = () => {
    for (let s = 0; s < studentIds.length; s++) {
      if (!studentIds[s]) {
        toast.error(`Enter Student ${s + 1} ID`);
        return false
      }
      for (let cat of categories) {
        if (!drops[pose][s] && scores[pose][s][cat.key] === "") {

          toast.error(`Pose ${pose + 1} Student ${s + 1}: ${cat.label}`);
          return false
        }
      }
    }
    return true;
  };

  const nextPose = () => {
    if (!validatePose()) return;

    if (pose < TOTAL_POSES - 1) {
      setPose(pose + 1);
    } else {
      submitAll();
    }
  };

  const submitAll = async () => {
    const payload = {
      group,
      judge: judgeId,
      students: studentIds.map((id, si) => ({
        studentId: id,
        poseScores: scores.map((p, pi) => ({
          ...p[si],
          drop: drops[pi][si]
        }))
      }))
    };

    try {
      const res = await fetch(`${URL}/submitscore/bulk`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // 🔥 SUCCESS CASE
      if (data.status === "success") {

        if (data.saved?.length > 0 && data.duplicates?.length === 0) {
          toast.success("All students scored! 🎉");
        }

        else if (data.saved?.length > 0 && data.duplicates?.length > 0) {
          toast.success(`Saved: ${data.saved.length}`);
          toast.error(`Already submitted: ${data.duplicates.join(", ")}`);
        }

        else if (data.saved?.length === 0 && data.duplicates?.length > 0) {
          toast.error(`All duplicates: ${data.duplicates.join(", ")}`);
        }

      } else {
        toast.error(data.message || "Failed");
      }

    } catch {
      toast.error("Server error");
    }
  };

  const addStudent = () => {
    setStudentIds(prev => {
      const updated = [...prev, ""];

      setScores(prevScores =>
        prevScores.map(pose => [
          ...pose,
          { ...emptyScore }
        ])
      );

      setDrops(prevDrops =>
        prevDrops.map(pose => [
          ...pose,
          false
        ])
      );

      return updated;
    });
  };

  const removeStudent = (index) => {
    setStudentIds(prev => prev.filter((_, i) => i !== index));

    setScores(prev =>
      prev.map(pose => pose.filter((_, i) => i !== index))
    );

    setDrops(prev =>
      prev.map(pose => pose.filter((_, i) => i !== index))
    );
  };

  useEffect(() => {
    if (!group || studentIds.length === 0) return;

    const timeout = setTimeout(() => {
      localStorage.setItem(
        `judgeData_${judgeId}`,
        JSON.stringify({ group, studentIds, scores, drops, pose })
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [group, studentIds, scores, drops, pose, judgeId]);

  useEffect(() => {
    const saved = localStorage.getItem(`judgeData_${judgeId}`);

    if (saved) {
      const data = JSON.parse(saved);

      setGroup(data.group);
      setStudentIds(data.studentIds);
      setScores(data.scores);
      setDrops(data.drops);
      setPose(data.pose);

      toast("Restored previous session 👍");
    }
  }, [judgeId]);
  return (
    <PageWrapper>
      <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-green-50 via-[#FAF3E0] to-green-100">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

          {/* TOP ROW */}
          <div className="flex items-center justify-between w-full">

            <div className="flex items-center gap-2">
              <button
                onClick={prevPose}
                disabled={pose === 0}
                className={`px-3 py-2 rounded-lg ${pose === 0
                    ? "bg-gray-200 text-gray-400"
                    : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                ←
              </button>

              <div>
                <h2 className="text-lg font-bold text-green-800">
                  🧘 Judge {judgeId}
                </h2>
                <p className="text-green-600 text-xs">
                  Pose {pose + 1}/5
                </p>
              </div>
            </div>

            <Logout />
          </div>

          {/* SECOND ROW */}
          <button
            onClick={addStudent}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium"
          >
            + Add Student
          </button>

        </div>

        {/* GROUP + IDS */}
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-md mb-6 flex flex-wrap gap-3 justify-center sm:justify-start">

          <select
            value={group}
            onChange={e => setGroup(e.target.value)}
            className="border border-green-400 px-3 py-2 rounded-lg text-center focus:ring-2 focus:ring-green-400"
          >
            <option value="">Group</option>
            {grp.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {studentIds.map((id, i) => (
            <div key={i} className="flex items-center gap-2">

              <input
                value={id}
                placeholder={`S${i + 1}`}
                onChange={e => {
                  const arr = [...studentIds];
                  arr[i] = e.target.value;
                  setStudentIds(arr);
                }}
                className="border px-3 py-2 rounded-lg w-20 text-center"
              />

            

            </div>
          ))}
        </div>

        {/* STUDENTS GRID */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">

          {studentIds.map((_, si) => (
            <div
              key={si}
              className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border hover:shadow-xl transition"
            >
              {studentIds.length > 1 && (
                <button
                  onClick={() => removeStudent(si)}
                  className="bg-gray-200 rounded-md px-2 py-1 text-red-500 text-xs absolute right-4 top-2"
                >
                  ✖
                </button>
              )}
              
              {/* HEADER */}
              <div className="flex justify-between items-center mb-3 mt-5">
                <h3 className="font-semibold text-green-700 text-lg">
                  Student {si + 1}
                </h3>

                <label className="flex items-center gap-1 text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={drops[pose][si]}
                    onChange={e => handleDrop(si, e.target.checked)}
                    className="accent-red-500"
                  />
                  <span className="text-red-600 font-medium">Drop</span>
                </label>
              </div>

              {/* CATEGORY INPUTS */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">

                {categories.map(cat => (
                  <div key={cat.key} className="flex justify-between items-center text-sm">

                    <span className="text-gray-700 w-2/3">
                      {cat.label}
                    </span>

                    <input
                      type="number"
                      value={scores[pose][si][cat.key]}
                      disabled={drops[pose][si]}
                      onChange={e => updateScore(si, cat.key, e.target.value)}
                      className="border border-gray-300 rounded-md w-16 text-center p-1 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                ))}

              </div>

            </div>
          ))}

        </div>

        {/* BUTTON */}
        <div className="flex justify-center mt-8">
          <button
            onClick={nextPose}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 text-white px-10 py-3 rounded-2xl font-semibold shadow-xl transition"
          >
            {pose === TOTAL_POSES - 1 ? "Submit Scores" : "Next Pose"}
          </button>
        </div>

      </div>
    </PageWrapper>
  );

};

export default JudgePanel;
