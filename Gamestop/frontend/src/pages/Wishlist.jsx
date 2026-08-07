import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductCard from "../components/home/ProductCard";
import { useWishlist } from "../context/WishlistContext";
import { FaHeart } from "react-icons/fa";

function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-10">
            <FaHeart className="text-red-600 text-4xl" />
            <h1 className="text-4xl sm:text-5xl font-bold">My Wishlist</h1>
            <span className="bg-red-600/20 text-red-500 text-sm font-bold px-3 py-1 rounded-full border border-red-500/30">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
            </span>
          </div>

          {wishlist.length === 0 ? (
            <div className="bg-zinc-900 rounded-2xl p-12 text-center max-w-xl mx-auto border border-zinc-800 shadow-xl">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-zinc-500">
                <FaHeart />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Your wishlist is empty
              </h2>
              <p className="text-gray-400 mb-8">
                Explore our catalog and click the heart icon on any game, console, or accessory to save it for later.
              </p>
              <Link
                to="/products"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition shadow-lg hover:shadow-red-900/40"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlist.map((product) => (
                <ProductCard
                  key={product.productId || product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Wishlist;
