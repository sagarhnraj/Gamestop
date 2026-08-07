function FilterSidebar({
  selectedCategories = [],
  setSelectedCategories,
  maxPrice = 100000,
  setMaxPrice,
  sortBy = "newest",
  setSortBy,
  onReset,
}) {
  const categoriesList = [
    { id: 2, label: "Games" },
    { id: 1, label: "Gaming Consoles" },
    { id: 3, label: "Gaming Accessories" },
    { id: 4, label: "Gaming Setup" },
  ];

  const handleCategoryToggle = (id) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((cId) => cId !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  return (
    <aside className="bg-zinc-900 rounded-2xl p-6 h-fit sticky top-24 border border-zinc-800 shadow-xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Filters</h2>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs text-red-500 hover:underline font-semibold"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="font-semibold text-zinc-300 mb-4">Categories</h3>
        <div className="space-y-3">
          {categoriesList.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-3 cursor-pointer text-zinc-300 hover:text-white transition select-none"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => handleCategoryToggle(cat.id)}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-zinc-300">Price Range</h3>
          <span className="text-sm font-bold text-red-500">
            Up to ₹{Number(maxPrice).toLocaleString("en-IN")}
          </span>
        </div>

        <input
          type="range"
          min="500"
          max="100000"
          step="500"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-red-600 cursor-pointer"
        />

        <div className="flex justify-between text-xs text-zinc-400 mt-2">
          <span>₹500</span>
          <span>₹1,00,000</span>
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-8">
        <h3 className="font-semibold text-zinc-300 mb-4">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:border-red-500 transition cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="price_low_high">Price : Low to High</option>
          <option value="price_high_low">Price : High to Low</option>
          <option value="highest_rated">Highest Rated</option>
        </select>
      </div>

      <button
        onClick={() => {
          // Filters apply in real-time
        }}
        className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold text-white transition shadow-lg active:scale-98"
      >
        Apply Filters
      </button>
    </aside>
  );
}

export default FilterSidebar;