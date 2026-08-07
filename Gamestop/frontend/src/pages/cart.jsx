import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useCart } from "../context/CartContext";

const PLACEHOLDER_IMAGE = "https://ik.imagekit.io/stringstackSG/Games%20Category.png";

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const total = cartItems.reduce(
    (sum, item) =>
      sum +
      (Number(item.product?.price) || 0) *
      item.quantity,
    0
  );

  const getProductImage = (item) => {
    if (!item) return PLACEHOLDER_IMAGE;
    const p = item.product || item;
    const img =
      p.image ||
      p.imageUrl ||
      item.image ||
      item.imageUrl ||
      item.productImage ||
      p.images?.[0]?.imageUrl ||
      p.images?.[0]?.image ||
      item.images?.[0]?.imageUrl;

    if (img && typeof img === "string" && img.trim() !== "") {
      return img.trim();
    }
    return PLACEHOLDER_IMAGE;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-5xl font-bold mb-10">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <h2 className="text-gray-400 text-xl">
            Your cart is empty.
          </h2>
        ) : (
          <>
            <div className="space-y-6">
              {cartItems.map((item) => {
                const imgUrl = getProductImage(item);
                const itemPrice = Number(item.product?.price || 0);

                return (
                  <div
                    key={item.id || item.product?.productId}
                    className="bg-zinc-900 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-zinc-800"
                  >
                    <div className="flex gap-5 items-center">
                      <div className="w-24 h-24 rounded-lg bg-zinc-950 p-2 border border-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={item.product?.name || "Product"}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PLACEHOLDER_IMAGE;
                          }}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div>
                        <h2 className="text-xl font-bold">
                          {item.product?.name}
                        </h2>

                        <p className="text-gray-300 font-semibold mt-1">
                          ₹{itemPrice.toLocaleString("en-IN")}
                        </p>

                        <div className="flex gap-3 mt-3 items-center">
                          <button
                            onClick={() =>
                              decreaseQuantity(item.product?.productId)
                            }
                            className="bg-zinc-800 w-8 h-8 rounded hover:bg-red-600 font-bold transition flex items-center justify-center border border-zinc-700"
                          >
                            -
                          </button>

                          <span className="w-6 text-center font-bold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              increaseQuantity(item.product?.productId)
                            }
                            className="bg-zinc-800 w-8 h-8 rounded hover:bg-green-600 font-bold transition flex items-center justify-center border border-zinc-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.product?.productId)
                      }
                      className="bg-red-600 px-5 py-3 rounded-lg hover:bg-red-700 font-semibold transition self-end sm:self-center"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <div className="flex justify-between text-3xl font-bold">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-8 bg-red-600 hover:bg-red-700 py-4 rounded-xl text-lg font-bold transition shadow-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Cart;