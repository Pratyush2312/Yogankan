import { useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router'
import PageWrapper from './PageWrapper';
const URL=import.meta.env.VITE_BACKEND_URL
const AdminLogin = () => {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!adminId.trim()) {
            toast.error("Enter admin id")
            return
        }
        if (!password) {
            toast.error("Enter password")
            return
        }
        try {
            const res = await fetch(`${URL}/auth/admin/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ adminId, password }),
            })
            const data = await res.json()
            if (data.status === 'success') {
                navigate('/admin/panel')
            }
            else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error("Error connecting to the backend")
        }

    }
    return (
        <PageWrapper>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF3E0] via-[#F3F7E9] to-[#E8F5E9] px-4">

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl 
      px-6 sm:px-10 md:px-12 
      py-8 sm:py-12 md:py-14 
      w-full max-w-sm text-center">

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#8E6B23] mb-6 sm:mb-8">
                        Admin Login
                    </h1>

                    <form className="flex flex-col gap-4 sm:gap-5">
                        <input
                            type="text"
                            placeholder="Enter Admin ID"
                            value={adminId}
                            onChange={(e) => setAdminId(e.target.value)}
                            className="px-4 py-3 sm:py-3.5 rounded-xl border border-yellow-300 
        focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-700"
                        />

                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="px-4 py-3 sm:py-3.5 rounded-xl border border-yellow-300 
        focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-700"
                        />

                        <button
                            onClick={handleLogin}
                            className="mt-3 sm:mt-4 py-3 w-full rounded-full bg-gradient-to-r 
        from-yellow-600 to-yellow-500 
        text-white font-semibold shadow-lg 
        hover:scale-105 transition-all duration-300"
                        >
                            Login
                        </button>
                    </form>

                    <p className="mt-4 sm:mt-6 text-xs sm:text-sm italic text-gray-600">
                        “Clarity. Control. Coordination.”
                    </p>

                </div>

            </div>

        </PageWrapper>

    )
}

export default AdminLogin


