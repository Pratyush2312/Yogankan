import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const URL = import.meta.env.VITE_BACKEND_URL;

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${URL}/logout`, {
        method: "POST",
        credentials: "include"
      });

      toast.success("Logged out successfully");
      navigate("/login"); // ya /admin-login
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow"
    >
      Logout
    </button>
  );
};

export default Logout;
