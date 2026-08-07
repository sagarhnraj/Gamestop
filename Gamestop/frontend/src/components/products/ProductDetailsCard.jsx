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
  const isConsole =
    categoryName.includes("console") ||
    categoryName.includes("hardware") ||
    categoryName.includes("device");

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
          "Solid game with incredible art direction and soundtrack. Had a minor bug early on but patched smoothly.",
        likes: 12,
      },
      {
        id: 4,
        author: "Samantha Vance",
        rating: 5,
        date: "3 weeks ago",
        comment:
          "One of the best titles released this year. Replayability is huge with all the side quests!",
        likes: 9,
      },
      {
        id: 5,
        author: "David K.",
        rating: 5,
        date: "1 month ago",
        comment:
          "GameStop packaging was super secure. Disc arrived in pristine condition. Highly recommended for fans!",
        likes: 15,
      },
      {
        id: 6,
        author: "Elena Rostova",
        rating: 4,
        date: "1 month ago",
        comment:
          "Great performance at 60 FPS. Combat mechanics feel crisp and responsive.",
        likes: 7,
      },
    ];
  } else if (isConsole) {
    return [
      {
        id: 1,
        author: "Liam O'Connor",
        rating: 5,
        date: "3 days ago",
        comment:
          "Blazing fast SSD load times and whisper-quiet fans even during intense gaming sessions. Absolutely top tier!",
        likes: 31,
      },
      {
        id: 2,
        author: "Rohan Gupta",
        rating: 5,
        date: "1 week ago",
        comment:
          "Upgraded from last gen and the difference is night and day. 4K HDR gaming on OLED TV looks surreal.",
        likes: 22,
      },
      {
        id: 3,
        author: "Chloe Bennett",
        rating: 5,
        date: "2 weeks ago",
        comment:
          "Original factory sealed package from GameStop with official warranty card. 100% authentic product.",
        likes: 19,
      },
      {
        id: 4,
        author: "Michael Scott",
        rating: 4,
        date: "3 weeks ago",
        comment:
          "Console is a beast! Setup took less than 10 minutes. Controller build quality feels premium.",
        likes: 14,
      },
      {
        id: 5,
        author: "Jessica Alba",
        rating: 5,
        date: "1 month ago",
        comment:
          "Fast delivery and great customer support from GameStop team. Perfectly packaged with zero damage.",
        likes: 11,
      },
      {
        id: 6,
        author: "Daniel Craig",
        rating: 5,
        date: "1 month ago",
        comment:
          "Best gaming investment this year. UI is ultra responsive and backward compatibility works flawless.",
        likes: 8,
      },
    ];
  } else {
    // Accessories / Setup / Accessories
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
      {
        id: 4,
        author: "Sophia Rodriguez",
        rating: 5,
        date: "3 weeks ago",
        comment:
          "Zero latency and robust build quality. Genuine accessory supplied by GameStop. Completely satisfied!",
        likes: 10,
      },
      {
        id: 5,
        author: "Amanda Knox",
        rating: 5,
        date: "1 month ago",
        comment:
          "Plug and play simplicity on both PC and console. Well worth every penny spent.",
        likes: 8,
      },
      {
        id: 6,
        author: "Chris Hemsworth",
        rating: 5,
        date: "1 month ago",
        comment:
          "Durable cable, excellent grip, and tactile response. GameStop delivered right on time!",
        likes: 6,
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
      const current = await getProductById(id);
      setProduct(current);

      // Fetch all products to pick 4-5 similar products
      const all = await getAllProducts();

      if (all && Array.isArray(all)) {
        const currentIdStr = String(id);

        // Filter out current product
        const remaining = all.filter((p) => {
          const pId = String(p.productId || p.id);
          return pId !== currentIdStr;
        });

        // Current category identification
        const currentCatId = current?.category?.id || current?.category?.categoryId || current?.category;
        const currentCatName = typeof current?.category === "object" ? current?.category?.name || current?.category?.category_name : String(current?.category || "");

        // Find products in same category
        const sameCategoryProds = remaining.filter((p) => {
          const catId = p.category?.id || p.category?.categoryId || p.category;
          const catName = typeof p.category === "object" ? p.category?.name || p.category?.category_name : String(p.category || "");

          if (currentCatId && catId && String(currentCatId) === String(catId)) return true;
          if (currentCatName && catName && currentCatName.toLowerCase() === catName.toLowerCase()) return true;
          return false;
        });

        // Products from other categories to fill slots up to 4
        const otherProds = remaining.filter((p) => !sameCategoryProds.includes(p));

        const combined = [...sameCategoryProds, ...otherProds].slice(0, 4);
        setSimilarProducts(combined);
      }
    } catch (error) {
      console.error("Error loading product details:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-zinc-400 font-semibold text-xl">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Product Not Found</h1>
        <Link to="/products" className="text-red-500 underline font-semibold">
          Back to Products Catalog
        </Link>
      </div>
    );
  }

  const reviews = getReviewsForProduct(product);
  const formattedPrice = Number(product.price || 0).toLocaleString("en-IN");
  const categoryLabel =
    typeof product.category === "object"
      ? product.category?.name || product.category?.category_name || "Gaming"
      : String(product.category || "Gaming");

  return (
    <div className="space-y-16">
      {/* MAIN PRODUCT DETAILS CARD */}
      <div className="grid lg:grid-cols-2 gap-12 items-start bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800/80 flex items-center justify-center min-h-[450px]">
          <img
            src={product.image || "https://via.placeholder.com/400x400?text=No+Image"}
            alt={product.name}
            className="max-h-[480px] w-full object-contain rounded-xl drop-shadow-2xl"
          />
        </div>

        <div className="space-y-6">
          <div>
            <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {categoryLabel}
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mt-3 leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-yellow-400 text-lg font-bold bg-yellow-400/10 px-3 py-1 rounded-lg border border-yellow-400/20">
              <FaStar />
              <span>{product.rating ?? "4.8"}</span>
            </div>
            <span className="text-zinc-400 text-sm font-medium">
              Based on {reviews.length + 120} verified customer reviews
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-4xl font-extrabold text-red-500">
              ₹{formattedPrice}
            </h2>
            <span className="text-xs text-zinc-400 font-medium">Inclusive of all taxes</span>
          </div>

          <p
            className={`text-sm font-bold flex items-center gap-2 ${
              product.stock > 0 ? "text-green-400" : "text-red-500"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                product.stock > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></span>
            {product.stock > 0
              ? `In Stock (${product.stock} units available)`
              : "Out of Stock"}
          </p>

          <p className="text-zinc-300 leading-relaxed text-base border-t border-b border-zinc-800/80 py-4">
            {product.description ||
              "Experience next-level performance and immersive gaming standard with this official product from GameStop."}
          </p>

          <div className="pt-2 w-full sm:w-64">
            <Button
              text="Add To Cart"
              onClick={() => addToCart(product)}
            />
          </div>
        </div>
      </div>

      {/* CUSTOMER REVIEWS SECTION */}
      <div className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800 space-y-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white flex items-center gap-3">
              <span className="w-2.5 h-8 bg-red-600 rounded-full inline-block"></span>
              Customer Reviews
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Real feedback from verified GameStop gamers
            </p>
          </div>

          {/* Rating Summary Box */}
          <div className="flex items-center gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-yellow-400">
                {product.rating ?? "4.8"}
              </div>
              <div className="flex text-yellow-400 text-xs mt-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <div className="text-xs text-zinc-500 mt-1 font-medium">Overall Rating</div>
            </div>

            <div className="h-10 w-[1px] bg-zinc-800"></div>

            <div className="text-xs text-zinc-400 space-y-1">
              <div className="flex items-center gap-2">
                <span>5 ★</span>
                <div className="w-24 bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-400 h-full w-[85%]"></div>
                </div>
                <span>85%</span>
              </div>
              <div className="flex items-center gap-2">
                <span>4 ★</span>
                <div className="w-24 bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-400 h-full w-[12%]"></div>
                </div>
                <span>12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-3 hover:border-zinc-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center font-bold text-sm border border-red-500/30">
                    {rev.author.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      {rev.author}
                      <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FaCheckCircle className="text-[9px]" /> Verified Buyer
                      </span>
                    </h4>
                    <span className="text-xs text-zinc-500">{rev.date}</span>
                  </div>
                </div>

                <div className="flex text-yellow-400 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < rev.rating ? "text-yellow-400" : "text-zinc-700"}
                    />
                  ))}
                </div>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed">{rev.comment}</p>

              <div className="pt-2 border-t border-zinc-900 flex items-center gap-2 text-xs text-zinc-500">
                <button className="flex items-center gap-1.5 hover:text-zinc-300 transition">
                  <FaThumbsUp /> Helpful ({rev.likes})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SIMILAR PRODUCTS / "YOU MAY ALSO LIKE" SECTION */}
      {similarProducts.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white flex items-center gap-3">
              <span className="w-2.5 h-8 bg-red-600 rounded-full inline-block"></span>
              You May Also Like
            </h2>
            <Link
              to="/products"
              className="text-sm font-bold text-red-500 hover:text-red-400 transition"
            >
              View All Products &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.map((simProduct) => (
              <ProductCard
                key={simProduct.productId || simProduct.id}
                product={simProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailsCard;