import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import FilterSidebar from "../components/products/FilterSidebar";
import ProductGrid from "../components/products/ProductGrid";
import { getAllProducts } from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState("newest");

  // Sync category from URL parameter on load/change
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategories([Number(categoryFromUrl)]);
    }
  }, [categoryFromUrl]);

  async function fetchProductsData() {
    setLoading(true);
    try {
      const data = await getAllProducts(3, 1000);
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProductsData();
  }, []);

  // Filter logic
  const filteredProducts = products.filter((product) => {
    // 1. Category Filter
    const matchesCategory =
      selectedCategories.length === 0 ||
      (product.category && selectedCategories.includes(Number(product.category.categoryId)));

    // 2. Price Filter
    const productPrice = Number(product.price || 0);
    const matchesPrice = productPrice <= maxPrice;

    return matchesCategory && matchesPrice;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_low_high") {
      return Number(a.price || 0) - Number(b.price || 0);
    }
    if (sortBy === "price_high_low") {
      return Number(b.price || 0) - Number(a.price || 0);
    }
    if (sortBy === "highest_rated") {
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    }
    // Default: Newest
    return (b.productId || b.id || 0) - (a.productId || a.id || 0);
  });

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(100000);
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-5xl font-bold mb-10">
          All Products
        </h1>

        {loading ? (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="hidden lg:block bg-zinc-900/40 rounded-2xl h-96 animate-pulse border border-zinc-800"></div>
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-zinc-900 rounded-2xl h-80 animate-pulse border border-zinc-800 flex items-center justify-center">
                  <span className="text-zinc-600 text-sm">Loading Catalog...</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            <FilterSidebar
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onReset={handleResetFilters}
            />

            {products.length > 0 ? (
              <ProductGrid products={sortedProducts} />
            ) : (
              <div className="lg:col-span-3 text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800 space-y-4">
                <p className="text-gray-400 text-lg">Connecting to GameStop MySQL catalog...</p>
                <button
                  onClick={fetchProductsData}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl transition"
                >
                  Reload Products Catalog 🔄
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Products;