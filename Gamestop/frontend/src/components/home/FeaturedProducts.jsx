import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getAllProducts } from "../../services/productService";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getAllProducts();
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error(error);
      }
    }

    fetchProducts();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      <div className="flex justify-between items-center mb-10">

        <h2 className="text-4xl font-bold">
          Featured Games
        </h2>

        <button className="text-red-500 hover:text-red-400 font-semibold">
          View All →
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {products.map((product) => (

          <ProductCard
            key={product.productId}
            product={product}
          />

        ))}

      </div>

    </section>
  );
}

export default FeaturedProducts;