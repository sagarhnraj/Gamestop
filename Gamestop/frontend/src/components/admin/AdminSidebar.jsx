import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaTags,
  FaUsers,
  FaShoppingCart,
  FaSignOutAlt,
  FaShieldAlt,
} from "react-icons/fa";

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/admin/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { label: "Products", path: "/admin/products", icon: <FaBox /> },
    { label: "Categories", path: "/admin/categories", icon: <FaTags /> },
    { label: "Users", path: "/admin/users", icon: <FaUsers /> },
    { label: "Orders", path: "/admin/orders", icon: <FaShoppingCart /> },
    { label: "Profile", path: "/admin/profile", icon: <FaUsers /> },
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between min-h-screen sticky top-0 h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/30">
            <FaShieldAlt className="text-xl" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">GameStop</h1>
            <span className="text-xs text-red-500 font-semibold tracking-wider uppercase">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                  isActive
                    ? "bg-red-600 text-white font-semibold shadow-lg shadow-red-600/20"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button at bottom */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-600/10 hover:text-red-500 transition font-medium text-sm border border-red-500/20"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
