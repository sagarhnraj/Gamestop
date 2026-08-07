import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  FaShoppingCart,
  FaSearch,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaBoxOpen,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { useState } from "react";
import { useCart } from "../../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const { cartItems, clearCart } = useCart();

  const searchQuery = searchParams.get("search") || "";

  const handleSearchChange = (value) => {
    if (location.pathname !== "/products") {
      navigate(value ? `/products?search=${encodeURIComponent(value)}` : "/products");
    } else {
      const newParams = new URLSearchParams(searchParams);
      if (value.trim()) {
        newParams.set("search", value);
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams);
    }
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const isLoggedIn =
    token && token !== "null" && token !== "undefined";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    clearCart();
    setAccountOpen(false);
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="https://ik.imagekit.io/stringstackSG/logo.png"
            alt="GameStop Logo"
            className="h-24 w-auto"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex gap-8 text-gray-300">

          <Link to="/" className="hover:text-red-500 transition">
            Home
          </Link>

          <Link
            to="/products"
            className="hover:text-red-500 transition"
          >
            Products
          </Link>

        </div>

        {/* Search */}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (location.pathname !== "/products") {
              navigate(searchQuery ? `/products?search=${encodeURIComponent(searchQuery)}` : "/products");
            }
          }}
          className="hidden md:flex items-center bg-zinc-800 rounded-lg overflow-hidden"
        >

          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-transparent px-4 py-2 outline-none text-white w-72"
          />

          <button type="submit" className="bg-red-500 px-4 py-3 hover:bg-red-600 transition text-white">
            <FaSearch />
          </button>

        </form>

        {/* Right */}

        <div className="flex items-center gap-5">

          {isLoggedIn ? (

            <div className="hidden md:block relative">

              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-2 hover:text-red-500 transition"
              >
                <FaUserCircle className="text-2xl" />
                <span className="max-w-[120px] truncate">
                  {username || "Account"}
                </span>
              </button>

              {accountOpen && (

                <div className="absolute right-0 mt-3 w-52 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">

                  <Link
                    to="/profile"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition"
                  >
                    <FaUser /> Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition"
                  >
                    <FaBoxOpen /> Orders
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition text-red-400"
                  >
                    <FaSignOutAlt /> Logout
                  </button>

                </div>

              )}

            </div>

          ) : (

            <Link
              to="/login"
              className="hidden md:block hover:text-red-500 transition"
            >
              Login
            </Link>

          )}

          <Link
            to="/cart"
            className="relative text-2xl hover:text-red-500 transition"
          >
            <FaShoppingCart />

            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">

              {cartCount}

            </span>

          </Link>

          <button
            className="lg:hidden text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

        </div>

      </div>

      {menuOpen && (

        <div className="lg:hidden bg-zinc-900 border-t border-zinc-800">

          <div className="flex flex-col p-5 gap-5">

            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>

            <Link to="/products" onClick={() => setMenuOpen(false)}>
              Products
            </Link>

            {isLoggedIn ? (

              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>

                <Link to="/orders" onClick={() => setMenuOpen(false)}>
                  Orders
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-left text-red-400"
                >
                  Logout
                </button>
              </>

            ) : (

              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>

            )}

          </div>

        </div>

      )}

    </nav>
  );
}

export default Navbar;