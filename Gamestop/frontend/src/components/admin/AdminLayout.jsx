import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { FaUserCircle } from "react-icons/fa";

function AdminLayout({ children }) {
  const username = localStorage.getItem("username") || "Admin User";
  const role = localStorage.getItem("role") || "ROLE_ADMIN";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Left Sidebar */}
      <AdminSidebar />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-zinc-900/80 backdrop-blur border-b border-zinc-800 px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-xl font-bold text-white">Administrator Control Panel</h2>
          </div>

          <Link
            to="/admin/profile"
            className="flex items-center gap-3 bg-zinc-800/80 hover:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-700 transition cursor-pointer"
          >
            <FaUserCircle className="text-xl text-red-500" />
            <span className="font-semibold text-sm text-gray-200">{username}</span>
            <span className="bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">
              {role}
            </span>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
