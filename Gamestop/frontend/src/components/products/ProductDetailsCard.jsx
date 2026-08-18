import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaStar,
  FaCheckCircle,
  FaThumbsUp,
  FaUserCircle,
  FaShoppingBag,
} from "react-icons/fa";
import Button from "../common/Button";
import ProductCard from "../home/ProductCard";
import { useCart } from "../../context/CartContext";
import { getProductById, getAllProducts } from "../../services/productService";

// Helper to generate 6 category-aware realistic customer reviews
function getReviewsForProduct(product) {
  if (!product) return [];

  const categoryName = (
    typeof product.category === "object"
      ? product.category?.name || product.category?.category_name || ""
      : String(product.category || "")
  ).toLowerCase();

  const isGame =
    categoryName.includes("game") ||
    categoryName.includes("ps5") ||
    categoryName.includes("xbox") ||
    categoryName.includes("switch");

  if (isGame) {
    return [
      {
        id: 1,
        author: "Alex Rivers",
        rating: 5,
        date: "2 days ago",
        comment:
          "Mind-blowing graphics and smooth gameplay! The storyline kept me hooked for 40+ hours. Worth every rupee.",
        likes: 24,
      },
      {
        id: 2,
        author: "Priya Sharma",
        rating: 5,
        date: "1 week ago",
        comment:
          "Fast delivery from GameStop! The DualSense haptic feedback integration in this title is astonishing.",
        likes: 18,
      },
      {
        id: 3,
        author: "Marcus Thorne",
        rating: 4,
        date: "2 weeks ago",
        comment:
          "Great performance and awesome sound track. Super fast shipping from GameStop team.",
        likes: 12,
      },
    ];
  } else {
    return [
      {
        id: 1,
        author: "Kevin Flynn",
        rating: 5,
        date: "2 days ago",
        comment:
          "Ergonomics are top notch! Battery life lasts for days of heavy gaming without needing a recharge.",
        likes: 27,
      },
      {
        id: 2,
        author: "Maya Lin",
        rating: 5,
        date: "5 days ago",
        comment:
          "Crystal clear sound stage and deep bass response. Super comfortable padding for 6+ hour gaming sessions.",
        likes: 16,
      },
      {
        id: 3,
        author: "Victor Vance",
        rating: 4,
        date: "2 weeks ago",
        comment:
          "RGB lighting integration looks epic on my desk setup. Tactile switch feedback is incredibly satisfying.",
        likes: 13,
      },
    ];
  }
}

function ProductDetailsCard() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchProductAndSimilar();
  }, [id]);

  async function fetchProductAndSimilar() {
    try {
      setLoading(true);
      let current = null;
      try {
        current = await getProductById(id);
      } catch (err) {
        console.warn("getProductById direct call failed, trying fallback...", err);
      }

      const all = await getAllProducts(3, 1000);

      if (!current && Array.isArray(all)) {
        current = all.find((p) => String(p.productId || p.id) === String(id));
      }

      setProduct(current);

      if (all && Array.isArray(all)) {
        const currentIdStr = String(id);
        const remaining = all.filter((p) => String(p.productId || p.id) !== currentIdStr);

        const currentCatId = current?.category?.id || current?.category?.categoryId || current?.category;
        const currentCatName = typeof current?.category === "object" ? current?.category?.name || current?.category?.category_name : String(current?.category || "");

        const sameCategoryProds = remaining.filter((p) => {
          const catId = p.category?.id || p.category?.categoryId || p.category;
          const catName = typeof p.category === "object" ? p.category?.name || p.category?.category_name : String(p.category || "");

          if (currentCatId && catId && String(currentCatId) === String(catId)) return true;
          if (currentCatName && catName && currentCatName.toLowerCase() === catName.toLowerCase()) return true;
          return false;
        });

        const otherProds = remaining.filter((p) => !sameCategoryProds.includes(p));
        const combined = [...sameCategoryProds, ...otherProds].slice(0, 4);
        setSimilarProducts(combined);
      }
    } catch (error) {
      console.error("Error in fetchProductAndSimilar:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Loading Product Details...</h2>
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center text-white space-y-4">
        <h2 className="text-3xl font-bold text-red-500">Product Not Found</h2>
        <p className="text-gray-400">The product you are looking for does not exist or was removed.</p>
        <Link to="/products" className="inline-block bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl transition">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const reviews = getReviewsForProduct(product);
  const formattedPrice = Number(product.price || 0).toLocaleString("en-IN");
  const categoryDisplayName =
    typeof product.category === "object"
      ? product.category?.name || product.category?.categoryName || "Gaming"
      : String(product.category || "Gaming");

  return (
    <div className="space-y-16">
      <div className="grid lg:grid-cols-2 gap-12 bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl">
        <div className="relative aspect-square bg-zinc-950 rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-zinc-800">
          <img
            src={product.image || "https://via.placeholder.com/600x600?text=No+Image"}
            alt={product.name}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div>
            <span className="inline-block bg-red-600/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-red-500/30">
              {categoryDisplayName}
            </span>
            <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-400">
                <FaStar />
                <span className="font-bold text-white text-lg ml-1">
                  {product.rating ?? "4.8"}
                </span>
              </div>
              <span className="text-zinc-600">|</span>
              <span className="text-green-400 font-semibold text-sm flex items-center gap-1">
                <FaCheckCircle /> In Stock ({product.stock || 10} units)
              </span>
            </div>
            <p className="text-zinc-300 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="pt-6 border-t border-zinc-800 space-y-6">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-red-500">
                ₹{formattedPrice}
              </span>
              <span className="text-zinc-500 text-sm">Inclusive of all taxes</span>
            </div>

            <Button
              text="Add to Cart 🛒"
              onClick={() => addToCart(product)}
              className="w-full text-lg py-4 shadow-lg shadow-red-600/30"
            />
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl space-y-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span>Customer Reviews</span>
          <span className="text-sm font-normal text-zinc-400">({reviews.length} reviews)</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaUserCircle className="text-zinc-500 text-xl" />
                  <span className="font-semibold text-white">{rev.author}</span>
                </div>
                <span className="text-xs text-zinc-500">{rev.date}</span>
              </div>
              <div className="flex text-yellow-400 text-xs">
                {[...Array(rev.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Products Carousel / Section */}
      {similarProducts.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-white">Similar Products You Might Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.map((simProd) => (
              <ProductCard key={simProd.productId || simProd.id} product={simProd} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailsCard;