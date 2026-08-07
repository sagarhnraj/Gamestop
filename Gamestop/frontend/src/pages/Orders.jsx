import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getOrders } from "../services/orderService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        <h1 className="text-4xl font-bold mb-10">My Orders</h1>

        {loading ? (

          <p className="text-gray-400">Loading orders...</p>

        ) : error ? (

          <p className="text-red-400">{error}</p>

        ) : orders.length === 0 ? (

          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">
              You haven't placed any orders yet.
            </p>
            <Link
              to="/products"
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
            >
              Start Shopping
            </Link>
          </div>

        ) : (

          <div className="space-y-6">

            {orders.map((order) => (

              <div
                key={order.orderId}
                className="bg-zinc-900 rounded-xl p-6 border border-zinc-800"
              >

                <div className="flex flex-wrap justify-between gap-4 mb-4">

                  <div>
                    <p className="text-sm text-gray-400">Order ID</p>
                    <p className="font-mono text-sm break-all">
                      {order.orderId}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span className="inline-block bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {order.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-lg font-bold">
                      ₹{order.totalAmount}
                    </p>
                  </div>

                </div>

                <div className="border-t border-zinc-800 pt-4 space-y-2">

                  {order.items?.map((item) => (

                    <div
                      key={item.id}
                      className="flex justify-between text-gray-300"
                    >
                      <span>
                        {item.product?.name} × {item.quantity}
                      </span>
                      <span>₹{item.totalPrice}</span>
                    </div>

                  ))}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      <Footer />

    </div>
  );
}

export default Orders;
