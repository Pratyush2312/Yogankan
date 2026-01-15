import './App.css'
import JudgePanel from './components/JudgePanel'
import Login from './components/Login'
import { Route, Routes, useLocation } from 'react-router'
import Admin from './components/Admin'
import Landing from './components/Landing'
import AdminLogin from './components/AdminLogin'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

function App() {
  const location = useLocation()
  return (
    <>
      <AnimatePresence mode='wait'>
        <Toaster />
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path='/admin' element={<AdminLogin />} />
          <Route path="/admin/panel" element={<Admin />} />
          <Route path="/judge/:judgeId" element={<JudgePanel />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
