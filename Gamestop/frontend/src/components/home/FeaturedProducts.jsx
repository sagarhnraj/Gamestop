import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getAllProducts } from "../../services/productService";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getAllProducts(3, 1000);
      if (Array.isArray(data)) {
        setProducts(data.slice(0, 4));
      }
    } catch (error) {
      console.error("Error loading featured products:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold text-white">
          Featured Games
        </h2>
        <a href="/products" className="text-red-500 hover:text-red-400 font-semibold">
          View All →
        </a>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-zinc-900 rounded-2xl h-80 animate-pulse border border-zinc-800 flex items-center justify-center">
              <span className="text-zinc-600 text-sm">Loading Product...</span>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.productId || product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-zinc-900/50 rounded-2xl border border-zinc-800 space-y-4">
          <p className="text-gray-400">Connecting to GameStop MySQL catalog...</p>
          <button
            onClick={loadProducts}
            className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
          >
            Retry Loading Products 🔄
          </button>
        </div>
      )}
    </section>
  );
}

export default FeaturedProducts;