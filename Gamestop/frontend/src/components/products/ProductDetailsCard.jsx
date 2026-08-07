import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import Button from "../common/Button";
import { useCart } from "../../context/CartContext";
import { getProductById } from "../../services/productService";

function ProductDetailsCard() {

  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <h1 className="text-3xl text-center">
        Loading...
      </h1>
    );
  }

  if (!product) {
    return (
      <h1 className="text-3xl text-center">
        Product Not Found
      </h1>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">

      <div className="bg-zinc-900 rounded-2xl p-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[500px] object-contain rounded-xl"
        />
      </div>

      <div>

        <h1 className="text-5xl font-bold mb-5">
          {product.name}
        </h1>

        <div className="flex items-center gap-2 text-yellow-400 text-xl mb-6">
          <FaStar />
          <span>{product.rating ?? "4.8"}</span>
        </div>

        <h2 className="text-4xl font-bold text-red-500 mb-6">
          ₹{product.price}
        </h2>

        <p
          className={`mb-6 text-lg font-semibold ${
            product.stock > 0
              ? "text-green-400"
              : "text-red-500"
          }`}
        >
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </p>

        <p className="text-gray-300 leading-8 mb-10">
          {product.description}
        </p>

        <div className="w-64">
          <Button
            text="Add To Cart"
            onClick={() => addToCart(product)}
          />
        </div>

      </div>

    </div>
  );
}

export default ProductDetailsCard;