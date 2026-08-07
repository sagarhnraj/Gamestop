import { useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaHeart } from "react-icons/fa";
import Button from "../common/Button";
import { useCart } from "../../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-red-500/20 hover:-translate-y-2 transition-all duration-300">

      <div className="relative">

        <Link to={`/product/${product.productId}`}>
          <img
           src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
           alt={product.name}
           className="h-72 w-full object-cover cursor-pointer"
          />
        </Link>

        <button
          onClick={() => setLiked(!liked)}
          className={`absolute top-4 right-4 p-3 rounded-full transition ${
            liked ? "bg-red-600" : "bg-zinc-800"
          }`}
        >
          <FaHeart className="text-white" />
        </button>

      </div>

      <div className="p-5">

        <Link to={`/product/${product.productId}`}>
          <h3 className="font-bold text-xl mb-2 hover:text-red-500 transition">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-yellow-400 mb-4">
          <FaStar />
          <span>{product.rating ?? "4.8"}</span>
        </div>

        <div className="flex justify-between items-center mb-5">

          <span className="text-red-500 text-2xl font-bold">
            ₹{product.price}
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