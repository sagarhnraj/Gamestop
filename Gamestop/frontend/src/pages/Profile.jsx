import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useCart } from "../context/CartContext";

function Profile() {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    clearCart();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        <h1 className="text-4xl font-bold mb-10">My Profile</h1>

        <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 space-y-6">

          <div>
            <p className="text-sm text-gray-400">Username</p>
            <p className="text-xl font-semibold">{username || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">User ID</p>
            <p className="text-xl font-semibold">{userId || "-"}</p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">

            <Link
              to="/orders"
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
            >
              View Orders
            </Link>

            <button
              onClick={handleLogout}
              className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-lg font-semibold"
            >
              Logout
            </button>

          </div>

        </div>

      </div>

      <Footer />

    </div>
  );
}

export default Profile;
