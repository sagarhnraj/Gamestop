import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCategories } from "../../services/categoryService";

const categoryData = {
  1: {
    name: "Gaming Consoles",
    image: "https://ik.imagekit.io/stringstackSG/Gaming%20consoles.png",
  },
  2: {
    name: "Games",
    image: "https://ik.imagekit.io/stringstackSG/Games%20Category.png",
  },
  3: {
    name: "Gaming Accessories",
    image: "https://ik.imagekit.io/stringstackSG/Gaming%20Accessories.png",
  },
  4: {
    name: "Gaming Setup",
    image: "https://ik.imagekit.io/stringstackSG/Gaming%20Setup.png",
  },
};

const defaultCategories = [
  {
    categoryId: 1,
    name: "Gaming Consoles",
    image: "https://ik.imagekit.io/stringstackSG/Gaming%20consoles.png",
  },
  {
    categoryId: 2,
    name: "Games",
    image: "https://ik.imagekit.io/stringstackSG/Games%20Category.png",
  },
  {
    categoryId: 3,
    name: "Gaming Accessories",
    image: "https://ik.imagekit.io/stringstackSG/Gaming%20Accessories.png",
  },
  {
    categoryId: 4,
    name: "Gaming Setup",
    image: "https://ik.imagekit.io/stringstackSG/Gaming%20Setup.png",
  },
];

function CategorySection() {
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getAllCategories();
        if (data && data.length > 0) {
          const merged = data.map((cat) => {
            const mapped = categoryData[cat.categoryId] || {};
            return {
              ...cat,
              name: mapped.name || cat.name,
              image: mapped.image || cat.image,
            };
          });
          setCategories(merged);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchCategories();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold mb-10 text-white">Shop By Category</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((category) => {
          const imgUrl =
            category.image ||
            categoryData[category.categoryId]?.image ||
            "https://ik.imagekit.io/stringstackSG/Games%20Category.png";
          const catName =
            categoryData[category.categoryId]?.name || category.name;

          return (
            <Link
              key={category.categoryId}
              to={`/products?category=${category.categoryId}`}
              className="group relative bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-red-900/30 transition-all duration-300 transform hover:-translate-y-2 border border-zinc-800 hover:border-red-600/50"
            >
              <div className="relative w-full aspect-square overflow-hidden bg-zinc-950 flex items-center justify-center p-2">
                <img
                  src={imgUrl}
                  alt={catName}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors duration-300">
                    {catName}
                  </h3>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default CategorySection;

