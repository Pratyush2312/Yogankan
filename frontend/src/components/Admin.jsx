import { useState } from 'react'
import toast from 'react-hot-toast'
import PageWrapper from './PageWrapper'
import { GrPowerReset } from "react-icons/gr"
import Edit from './Edit'

const grp = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
const URL=import.meta.env.VITE_BACKEND_URL
const Admin = () => {
    const [StudentId, setStudentId] = useState("")
    const [result, setresult] = useState(null)
    const [activeTab, setactiveTab] = useState("")
    const [students, setstudents] = useState([])
    const [allResults, setAllResults] = useState([]);
    const [loading, setLoading] = useState(false)
    const [showmodal, setshowModal] = useState(false)
    // const [showTable, setShowTable] = useState(false);
    const [group, setgroup] = useState("")
    const handleReset = async () => {
        try {
            const res = await fetch(`${URL}/reset-scores`, {
                credentials: "include",
                method: "DELETE"
            })

            const data = await res.json();

            if (data.status === "success") {
                toast.success("Database reset successfully!");
            }
            setshowModal(false)
        }
        catch (err) {
            toast.error("Error resetting database");
        }
    }

    const fetchResults = async () => {
        if (!StudentId) {
            toast("Please enter Student ID!", { icon: "⚠️" })
            return;
        }
        setLoading(true)


        const toastId = toast.loading("Loading result...")

        try {
            const res = await fetch(`${URL}/results/${group}/${StudentId}`, {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await res.json()
            setresult(data)
            setTimeout(() => {
                toast.success(`Result for Student ${StudentId} fetched!`)
            }, 700);

        } catch (error) {
            toast.error("Error fetching results")
        }
        setTimeout(() => {
            setLoading(false)
            toast.dismiss(toastId)
        }, 700);
    }
    
    const fetchAllResults = async (selectedGroup) => {
        console.log(selectedGroup)
        if (!selectedGroup) {
            toast("Select group first", { icon: "⚠️" });
            return;
        }
        setLoading(true)
        const toastId = toast.loading("Loading results...")
        try {

            const students = await fetch(`${URL}/students/${selectedGroup}`, {
                credentials: "include",
            }).then(res => res.json());

            let final = [];

            for (let sid of students) {
                const res = await fetch(`${URL}/results/${selectedGroup}/${sid}`, {
                    credentials: "include"
                })
                const data = await res.json();

                final.push({
                    studentId: sid,
                    combinedTotal: data.combinedTotal
                });
            }

            const sortedresults = [...final].sort((a, b) => b.combinedTotal - a.combinedTotal)
            setAllResults(sortedresults)
            console.log(sortedresults)
            setTimeout(() => {
                toast.success("All student results fetched!")
            }, 700);

        } catch (err) {
            toast.error("Error fetching all student results");
        }
        setTimeout(() => {
            setLoading(false)
            toast.dismiss(toastId)
        }, 700);
    };

    const handleExport = () => {
        window.open(`${URL}/export`, "_blank")
    }

    return (
        <PageWrapper>
            <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] via-[#F3F7E9] to-[#E8F5E9] px-4 sm:px-8 py-8">

                {/* Header */}
                <div className="relative flex flex-col sm:flex-row justify-center items-center mb-8 gap-4">
                    <h1 className="text-3xl sm:text-5xl font-serif text-[#4CAF50] tracking-wide text-center">
                        Admin Panel
                    </h1>

                    <div className="sm:absolute sm:right-6 flex gap-2">
                        <button onClick={handleExport}
                            className="bg-blue-500 text-white px-3 py-2 rounded-xl shadow hover:bg-blue-600 transition">
                            Export CSV
                        </button>

                        <button
                            className="bg-yellow-500 text-white px-4 py-2 rounded-xl shadow hover:bg-yellow-600 transition"
                            onClick={() => setactiveTab("edit")}
                        >
                            Edit
                        </button>

                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-xl shadow hover:bg-red-600 transition"
                            onClick={() => setshowModal(true)}
                        >
                            <GrPowerReset />
                        </button>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
                    <button
                        className="w-full sm:w-56 h-40 sm:h-56 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl 
      flex items-center justify-center text-lg sm:text-xl font-semibold 
      text-green-700 hover:scale-105 transition"
                        onClick={() => setactiveTab("search")}
                    >
                        🔍 Search Result
                    </button>

                    <button
                        className="w-full sm:w-56 h-40 sm:h-56 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl 
      flex items-center justify-center text-lg sm:text-xl font-semibold 
      text-green-700 hover:scale-105 transition"
                        onClick={() => setactiveTab("all")}
                    >
                        📊 All Students
                    </button>
                </div>

                {/* Content */}
                <div className="flex justify-center">
                    {activeTab === "search" && (
                        <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-lg w-full max-w-md">
                            <div className="flex flex-col gap-3 mb-4">
                                <input
                                    type="number"
                                    value={StudentId}
                                    placeholder="Enter Student ID"
                                    className="flex-1 px-3 py-2 rounded-xl border border-green-300 focus:ring-2 focus:ring-green-400"
                                    onChange={(e) => setStudentId(Number(e.target.value))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { fetchResults() } }}
                                />
                                <label className='font-semibold'>Choose Group:</label>
                                <select name="grp" value={group} onChange={(e) => { setgroup(e.target.value) }} className="flex-1 px-2 py-2 rounded-xl border border-green-300 focus:ring-2 focus:ring-green-400" >
                                    <option value="" disabled>
                                        Select Group
                                    </option>
                                    {grp.map((i) => (
                                        <option key={i} value={i}>{i}</option>
                                    ))}
                                </select>
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded-xl shadow hover:bg-green-600"
                                    onClick={fetchResults}
                                >
                                    Get Result
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center mt-5">
                                    <div className="w-8 h-8 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                result && (
                                    <div className="mt-4 bg-[#4CAF50] text-white p-4 rounded-xl">
                                        <h2 className="text-lg mb-2">Student {result.studentId}</h2>
                                        {result.judgeScores?.map((entry) => (
                                            <div key={entry._id} className="text-sm">
                                                Judge {entry.judgeId} : {entry.finalTotal}
                                            </div>
                                        ))}
                                        <div className="mt-3 text-xl font-bold">
                                            Combined Total: {result.combinedTotal}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {activeTab === "all" && (
                        <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-xl w-full max-w-4xl">

                            <h2 className="text-xl sm:text-2xl font-serif text-green-700 text-center mb-4">
                                Group {group || "-"} Leaderboard
                            </h2>

                            <div className="flex justify-center mb-4">
                                <select
                                    value={group}
                                    onChange={(e) => {
                                        setgroup(e.target.value)
                                        fetchAllResults(e.target.value)
                                    }}
                                    className="px-4 py-2 rounded-xl border border-green-400 w-full sm:w-auto"
                                >
                                    <option value="">Select Group</option>
                                    {grp.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse rounded-xl overflow-hidden text-sm sm:text-base">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                            <th className="p-3">Rank</th>
                                            <th className="p-3">Student ID</th>
                                            <th className="p-3">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allResults.map((s, index) => (
                                            <tr key={s.studentId}
                                                className={`text-center ${index % 2 === 0 ? "bg-green-50" : "bg-white"} hover:bg-green-100`}>
                                                <td className="p-3 font-semibold">#{index + 1}</td>
                                                <td className="p-3">{s.studentId}</td>
                                                <td className="p-3 font-bold text-green-700">{s.combinedTotal}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    )}
                    {showmodal && (
                        <div className="z-10 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md">
                                <h2 className="text-xl font-bold mb-4 text-red-600">Are you sure?</h2>
                                <p className="mb-6 text-gray-700"> This action will permanently delete all scores from the database. </p>
                                <div className="flex justify-end gap-4">
                                    <button onClick={() => setshowModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400" > Cancel </button> <button onClick={handleReset} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" > Confirm Reset </button>
                                </div>
                            </div>
                        </div>)}
                    {activeTab === 'edit' && (
                        <div>
                            <Edit />
                        </div>
                    )}
                </div>

            </div>

        </PageWrapper >

    )
}


export default Admin
