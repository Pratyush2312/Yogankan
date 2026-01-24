import toast from 'react-hot-toast';
import { useState, useEffect } from 'react'
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
    { key: "overallPerformance", label: "Overall Performance (10)" },
]

const TOTAL_POSES = 5
const grp = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
const JudgePanel = () => {
    const { judgeId } = useParams()
    const [group, setgroup] = useState("")
    const emptyPoseScore = categories.reduce((acc, c) => ({ ...acc, [c.key]: "" }), {});
    const [poseIndex, setPoseIndex] = useState(0); // which pose is active
    const [drop, setDrop] = useState(false)
    const [scores, setScores] = useState(
        Array(TOTAL_POSES).fill().map(() => ({ ...emptyPoseScore }))
    )

    const [studentId, setStudentId] = useState("");
    const [isAuth, setIsAuth] = useState(true);



    const updateScore = (category, value) => {
        const updatedScores = [...scores];
        updatedScores[poseIndex][category] = value === "" ? "" : Number(value);
        setScores(updatedScores);
    }

    const getPoseTotal = (index) => {
        return Object.values(scores[index]).reduce((sum, v) => sum + (Number(v) || 0), 0);
    }

    const handleNext = () => {
        // validation before going next
        for (let cat of categories) {
            if (scores[poseIndex][cat.key] === "") {
                toast.error(`Please fill ${cat.label}`);
                return;
            }
        }
        if (poseIndex < TOTAL_POSES - 1) {
            setPoseIndex(poseIndex + 1);
        }
    }

    const handleSubmit = async () => {
        for (let pose = 0; pose < TOTAL_POSES; pose++) {
            for (let cat of categories) {
                if (scores[pose][cat.key] === "") {
                    toast.error(`Pose ${pose + 1}: ${cat.label} missing`);
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
            poseScores: scores,
            group: group,
            drop: drop ? "Yes" : "No",
            totals: scores.map((_, i) => getPoseTotal(i))
        }

        try {
            const res = await fetch(`${URL}/submitscore`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.status === 'duplicate') {
                toast.error(data.message);
                return;
            }
            if (data.status === 'success') {
                toast.success("Score submitted! 🧘‍♂️");

                setPoseIndex(0);
                setStudentId("")
                setScores(Array(TOTAL_POSES).fill().map(() => ({ ...emptyPoseScore })))
                setDrop(false)

            }
        } catch (err) {
            console.error(err);
            toast.error("Error connecting to backend");
        }
    };

    return (
        <PageWrapper>
            <div className="min-h-screen px-4 sm:px-6 md:px-10 lg:px-16 bg-[#FAF3E0]">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#19e141] mb-2 p-2 sm:mb-4 text-center">
                    Judge Panel
                </h1>

                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-[#4CAF50] mb-6 text-center sm:text-left">
                    Welcome Judge {judgeId}!
                </h2>
                <Logout/>
                {/* STUDENT + GROUP */}
                <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                    <label className='font-semibold'>Group:</label>
                    <select
                        value={group}
                        onChange={(e) => setgroup(e.target.value)}
                        className='border px-3 py-2 rounded-xl w-full sm:w-auto'
                    >
                        <option value="" disabled>Select Group</option>
                        {grp.map((i) => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>

                    <label className="font-semibold">Student ID:</label>
                    <input
                        type="number"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="border px-3 py-2 rounded-xl w-full sm:w-32"
                    />
                    <label>Drop</label>
                    <input type="checkbox" checked={drop} onChange={(e) => {
                        setDrop(e.target.checked)
                        console.log(drop)
                    }} />
                    <p>{drop ? "Yes" : "No"}</p>
                </div>

                {/* CURRENT POSE */}
                <h2 className="text-lg sm:text-xl font-bold mb-3">
                    Pose {poseIndex + 1}
                </h2>

                {/* CATEGORY INPUTS */}
                <div className="bg-white shadow-lg p-4 sm:p-6 rounded-xl space-y-3">
                    {categories.map((cat) => (
                        <div
                            key={cat.key}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                            <label className="text-sm sm:text-base">{cat.label}</label>
                            <input
                                type="number"
                                className="w-full sm:w-28 border rounded-lg p-2 text-center"
                                value={scores[poseIndex][cat.key]}
                                onChange={(e) => updateScore(cat.key, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                {/* TOTAL */}
                <div className="mt-5 font-bold text-base sm:text-lg text-center sm:text-left">
                    Total: {getPoseTotal(poseIndex)}
                </div>

                {/* BUTTON */}
                <div className="mt-6 flex justify-center sm:justify-start">
                    {poseIndex < TOTAL_POSES - 1 ? (
                        <button
                            onClick={handleNext}
                            className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-8 py-2 rounded-full w-full sm:w-auto"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!isAuth}
                            className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-8 py-2 rounded-full w-full sm:w-auto"
                        >
                            Submit
                        </button>
                    )}
                </div>
            </div>

        </PageWrapper>
    )
}

export default JudgePanel;
