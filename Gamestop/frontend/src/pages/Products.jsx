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

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
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
    return (b.productId || 0) - (a.productId || 0);
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
          <h2 className="text-center text-2xl">
            Loading Products...
          </h2>
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
            <ProductGrid products={sortedProducts} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Products;