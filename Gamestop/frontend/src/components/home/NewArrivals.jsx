import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getAllProducts } from "../../services/productService";

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getAllProducts();
        if (data && data.length > 0) {
          // Group products by category ID to select across ALL available categories
          const categoryMap = {};
          data.forEach((product) => {
            const catId = product.category?.categoryId || "default";
            if (!categoryMap[catId]) {
              categoryMap[catId] = [];
            }
            categoryMap[catId].push(product);
          });

          // Round-robin selection across all categories
          const selected = [];
          const categoryKeys = Object.keys(categoryMap);
          const maxCount = Math.max(...categoryKeys.map((k) => categoryMap[k].length));

          for (let i = 0; i < maxCount; i++) {
            for (const key of categoryKeys) {
              if (categoryMap[key][i]) {
                selected.push(categoryMap[key][i]);
              }
            }
          }

          setProducts(selected);
        }
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      }
    }

    fetchProducts();
  }, []);

  // Duplicate items for a seamless continuous infinite carousel loop
  const displayProducts = [...products, ...products];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 overflow-hidden">
      <style>{`
        @keyframes slideLeftToRight {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0%, 0, 0);
          }
        }
        .animate-carousel-loop {
          display: flex;
          width: max-content;
          animation: slideLeftToRight 55s linear infinite;
          will-change: transform;
        }
        .animate-carousel-loop:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-bold text-white">New Arrivals</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Explore fresh gear across Consoles, Games, Accessories & Setups
          </p>
        </div>

        <button
          onClick={() => navigate("/products")}
          className="text-red-500 hover:text-red-400 font-semibold transition"
        >
          View All →
        </button>
      </div>

      {products.length > 0 ? (
        <div className="relative w-full overflow-hidden py-4">
          {/* Cinematic Edge Fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

          <div className="animate-carousel-loop gap-8">
            {displayProducts.map((product, idx) => (
              <div
                key={`${product.productId}-${idx}`}
                className="w-[280px] sm:w-[320px] flex-shrink-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-zinc-500 py-10">
          Loading New Arrivals...
        </div>
      )}
    </section>
  );
}

export default NewArrivals;