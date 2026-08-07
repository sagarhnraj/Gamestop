import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useCart } from "../context/CartContext";

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
      item.product.price *
      item.quantity,
    0
  );

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

              {cartItems.map((item) => (

                <div
                  key={item.id}
                  className="bg-zinc-900 rounded-xl p-5 flex justify-between items-center"
                >

                  <div className="flex gap-5 items-center">

                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />

                    <div>

                      <h2 className="text-xl font-bold">
                        {item.product.name}
                      </h2>

                      <p>
                        ₹{item.product.price}
                      </p>

                      <div className="flex gap-3 mt-3 items-center">

                        <button
                          onClick={() =>
                            decreaseQuantity(
                              item.product.productId
                            )
                          }
                          className="bg-zinc-700 w-8 h-8 rounded hover:bg-red-600"
                        >
                          -
                        </button>

                        <span>
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            increaseQuantity(
                              item.product.productId
                            )
                          }
                          className="bg-zinc-700 w-8 h-8 rounded hover:bg-green-600"
                        >
                          +
                        </button>

                      </div>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(
                        item.product.productId
                      )
                    }
                    className="bg-red-600 px-5 py-3 rounded-lg hover:bg-red-700"
                  >
                    Remove
                  </button>

                </div>

              ))}

            </div>

            <div className="mt-10 bg-zinc-900 rounded-xl p-6">

              <div className="flex justify-between text-3xl font-bold">

                <span>Total</span>

                <span>₹{total}</span>

              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-8 bg-red-600 hover:bg-red-700 py-4 rounded-xl text-lg font-bold"
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