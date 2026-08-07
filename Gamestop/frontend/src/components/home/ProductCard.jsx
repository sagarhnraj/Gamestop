import { Link } from "react-router-dom";
import { FaStar, FaHeart } from "react-icons/fa";
import Button from "../common/Button";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const productId = product.productId || product.id;
  const isWishlisted = isInWishlist(productId);
  const formattedPrice = Number(product.price || 0).toLocaleString("en-IN");

  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-red-500/20 hover:-translate-y-2 transition-all duration-300 border border-zinc-800">
      <div className="relative">
        <Link to={`/product/${productId}`}>
          <img
            src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
            alt={product.name}
            className="h-72 w-full object-cover cursor-pointer"
          />
        </Link>

        <button
          onClick={() => toggleWishlist(product)}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 z-10 ${
            isWishlisted
              ? "bg-red-600 shadow-lg shadow-red-600/50 scale-110"
              : "bg-zinc-800/80 hover:bg-zinc-700 text-gray-300"
          }`}
        >
          <FaHeart className={isWishlisted ? "text-white" : "text-gray-400"} />
        </button>
      </div>

      <div className="p-5">
        <Link to={`/product/${productId}`}>
          <h3 className="font-bold text-xl mb-2 hover:text-red-500 transition line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-yellow-400 mb-4">
          <FaStar />
          <span>{product.rating ?? "4.8"}</span>
        </div>

        <div className="flex justify-between items-center mb-5">
          <span className="text-red-500 text-2xl font-bold">
            ₹{formattedPrice}
          </span>
        </div>

        <Button
          text="Add to Cart"
          onClick={() => addToCart(product)}
        />
      </div>
    </div>
  );
}

export default ProductCard;