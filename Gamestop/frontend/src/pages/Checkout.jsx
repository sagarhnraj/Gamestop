import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import {
  createPaymentOrder,
  verifyPayment,
  loadRazorpayScript,
} from "../services/orderService";

function Checkout() {
  const navigate = useNavigate();

  const { cartItems, clearCart } = useCart();

  const [placing, setPlacing] = useState(false);

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  async function handlePay() {
    if (cartItems.length === 0 || placing) {
      return;
    }

    setPlacing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay. Check your internet connection."
        );
      }

      const paymentOrder = await createPaymentOrder();

      const options = {
        key: paymentOrder.razorpayKeyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "GameStop",
        description: "Order Payment",
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: localStorage.getItem("username") || "",
        },
        theme: {
          color: "#dc2626",
        },
        handler: async (response) => {
          try {
            await verifyPayment({
              orderId: paymentOrder.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            await clearCart();
            navigate("/payment-success");
          } catch (error) {
            alert(error.message);
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert(error.message);
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">

        <h1 className="text-4xl font-bold mb-10">
          Checkout
        </h1>

        <div className="grid md:grid-cols-2 gap-10">

          {/* Customer Details */}

          <div className="space-y-5">

            <input
              placeholder="Full Name"
              className="w-full p-3 rounded-lg bg-zinc-900"
            />

            <input
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-zinc-900"
            />

            <input
              placeholder="Phone Number"
              className="w-full p-3 rounded-lg bg-zinc-900"
            />

            <textarea
              rows="5"
              placeholder="Shipping Address"
              className="w-full p-3 rounded-lg bg-zinc-900"
            />

          </div>

          {/* Order Summary */}

          <div className="bg-zinc-900 rounded-xl p-6">

            <h2 className="text-2xl font-bold mb-6">
              Order Summary
            </h2>

            {cartItems.length === 0 ? (

              <p className="text-gray-400">
                No items in cart.
              </p>

            ) : (

              cartItems.map((item) => (

                <div
                  key={item.id}
                  className="flex justify-between mb-4"
                >

                  <span>
                    {item.product.name} × {item.quantity}
                  </span>

                  <span>
                    ₹{item.product.price * item.quantity}
                  </span>

                </div>

              ))

            )}

            <hr className="my-5" />

            <div className="flex justify-between text-2xl font-bold">

              <span>Total</span>

              <span>₹{total}</span>

            </div>

            <button
              onClick={handlePay}
              disabled={placing || cartItems.length === 0}
              className="mt-8 w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-xl text-lg font-bold"
            >
              {placing ? "Processing..." : `Pay ₹${total}`}
            </button>

          </div>

        </div>

      </div>

      <Footer />

    </div>
  );
}

export default Checkout;