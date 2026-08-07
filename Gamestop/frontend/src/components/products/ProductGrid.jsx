import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../home/ProductCard";

function ProductGrid({ products }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("search") || "";
  const [search, setSearch] = useState(searchFromUrl);

  useEffect(() => {
    setSearch(searchFromUrl);
  }, [searchFromUrl]);

  const handleSearchChange = (value) => {
    setSearch(value);
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lg:col-span-3">
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="w-full bg-zinc-900 rounded-lg p-4 mb-8 border border-zinc-700 outline-none text-white focus:border-red-500 transition"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <h2 className="text-xl text-gray-400">
              No products found.
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductGrid;