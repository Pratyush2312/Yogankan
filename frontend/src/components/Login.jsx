import { useNavigate } from 'react-router'
import toast from 'react-hot-toast';
import { useState } from 'react'
import PageWrapper from './PageWrapper';
const URL=import.meta.env.VITE_BACKEND_URL
const Login = () => {
  const [judgeId, setjudgeId] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!judgeId.trim()) {
      toast.error("Enter judge id")
      return
    }
    if (!password) {
      toast.error("Enter password")
      return
    }
    try {
      const res = await fetch(`${URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ judgeId, password }),
      })
      const data = await res.json()
      if (data.status === 'success') {
        setTimeout(() => {
          navigate(`/judge/${data.judgeId}`)
        }, 300);
      } else {
        toast.error(data.message)
      }
    }
    catch (err) {
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

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-green-700 mb-6 sm:mb-8">
            Judge Login
          </h1>

          <form className="flex flex-col gap-4 sm:gap-5">
            <input
              type="text"
              placeholder="Enter Judge ID"
              value={judgeId}
              onChange={(e) => setjudgeId(e.target.value)}
              className="px-4 py-3 rounded-xl border border-green-300 
                   focus:outline-none focus:ring-2 focus:ring-green-400 
                   text-gray-700"
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 rounded-xl border border-green-300 
                   focus:outline-none focus:ring-2 focus:ring-green-400 
                   text-gray-700"
            />

            <button
              onClick={handleLogin}
              className="mt-3 sm:mt-4 py-3 rounded-full 
                   bg-gradient-to-r from-green-600 to-green-500 
                   text-white font-semibold shadow-lg 
                   hover:scale-105 transition-all duration-300"
            >
              Login
            </button>
          </form>

          <p className="mt-5 sm:mt-6 text-xs sm:text-sm italic text-gray-600">
            “Calm mind. Clear judgment.”
          </p>
        </div>

      </div>

    </PageWrapper>

  )
}

export default Login
