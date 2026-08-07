import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { getAdminStats } from "../services/adminService";
import { FaUsers, FaBox, FaTags, FaShoppingCart } from "react-icons/fa";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
        setError("Unable to fetch dashboard statistics from backend.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cardData = [
    {
      title: "Total Users",
      count: stats.totalUsers,
      icon: <FaUsers className="text-3xl text-red-500" />,
      description: "Registered accounts in database",
      borderColor: "border-red-500/20",
    },
    {
      title: "Total Products",
      count: stats.totalProducts,
      icon: <FaBox className="text-3xl text-red-500" />,
      description: "Available items across catalog",
      borderColor: "border-red-500/20",
    },
    {
      title: "Total Categories",
      count: stats.totalCategories,
      icon: <FaTags className="text-3xl text-red-500" />,
      description: "Product categories defined",
      borderColor: "border-red-500/20",
    },
    {
      title: "Total Orders",
      count: stats.totalOrders,
      icon: <FaShoppingCart className="text-3xl text-red-500" />,
      description: "Customer orders processed",
      borderColor: "border-red-500/20",
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-zinc-400 text-sm">
            Live system summary metrics fetched directly from backend database APIs.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* 4 Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardData.map((card, idx) => (
            <div
              key={idx}
              className={`bg-zinc-900 border ${card.borderColor} rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400 font-semibold text-sm">
                  {card.title}
                </span>
                <div className="p-3 bg-zinc-800 rounded-xl">
                  {card.icon}
                </div>
              </div>

              <div>
                <div className="text-4xl font-extrabold text-white mb-1">
                  {loading ? (
                    <span className="inline-block w-12 h-8 bg-zinc-800 animate-pulse rounded"></span>
                  ) : (
                    card.count
                  )}
                </div>
                <p className="text-xs text-zinc-500">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
