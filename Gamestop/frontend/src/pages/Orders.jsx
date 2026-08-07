import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getOrders } from "../services/orderService";
import { generateInvoicePdf } from "../utils/generateInvoicePdf";
import {
  FaBoxOpen,
  FaShoppingBag,
  FaCalendarAlt,
  FaCreditCard,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaBox,
  FaBan,
  FaArrowRight,
  FaFileDownload,
} from "react-icons/fa";

const DEFAULT_PLACEHOLDER =
  "https://ik.imagekit.io/stringstackSG/Games%20Category.png";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId || token === "null" || token === "undefined") {
      navigate("/login");
      return;
    }

    fetchUserOrders();
  }, [navigate]);

  async function fetchUserOrders() {
    try {
      setLoading(true);
      setError("");
      const data = await getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error("Error loading user orders:", err);
      setError(err.message || "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  }

  // Handle opening details modal
  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Helper to render Order Status Badge
  const renderStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "DELIVERED":
        return (
          <span className="bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <FaCheckCircle className="text-xs" /> DELIVERED
          </span>
        );
      case "SHIPPED":
        return (
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <FaTruck className="text-xs" /> SHIPPED
          </span>
        );
      case "CONFIRMED":
      case "SUCCESS":
        return (
          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <FaBox className="text-xs" /> CONFIRMED
          </span>
        );
      case "CANCELLED":
      case "FAILED":
        return (
          <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <FaBan className="text-xs" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <FaClock className="text-xs" /> PENDING
          </span>
        );
    }
  };

  // Helper to render Payment Status Badge
  const renderPaymentBadge = (order) => {
    const statusUpper = (order.status || "").toUpperCase();
    const isPaid =
      statusUpper === "SUCCESS" ||
      statusUpper === "CONFIRMED" ||
      statusUpper === "SHIPPED" ||
      statusUpper === "DELIVERED" ||
      Boolean(order.razorpayPaymentId);

    if (isPaid) {
      return (
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
          PAID
        </span>
      );
    } else if (statusUpper === "CANCELLED" || statusUpper === "FAILED") {
      return (
        <span className="bg-zinc-800 text-zinc-500 border border-zinc-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          FAILED
        </span>
      );
    } else {
      return (
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
          PENDING
        </span>
      );
    }
  };

  // Date Formatter
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Calculate total item count for an order
  const getOrderTotalItems = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-zinc-800">
            <div>
              <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
                <FaBoxOpen className="text-red-500 text-3xl" /> My Orders
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                Track your purchased games, gaming hardware, and order fulfillment status
              </p>
            </div>

            {orders.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-sm text-zinc-400 font-medium">
                Total Orders Placed: <span className="text-white font-bold">{orders.length}</span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-24 text-center text-zinc-400 font-semibold text-lg">
              Loading your order history...
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-2xl text-center">
              <p className="font-bold">{error}</p>
              <button
                onClick={fetchUserOrders}
                className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                Retry Loading Orders
              </button>
            </div>
          ) : orders.length === 0 ? (
            /* Friendly Empty State */
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-2xl space-y-6">
              <div className="w-20 h-20 bg-red-600/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl border border-red-500/20">
                <FaShoppingBag />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  You haven't placed any orders yet.
                </h2>
                <p className="text-zinc-400 text-sm max-w-md mx-auto">
                  Explore our latest game releases, next-gen consoles, and gaming gear to start building your collection!
                </p>
              </div>
              <div>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-red-600/30 text-sm"
                >
                  <span>Continue Shopping</span>
                  <FaArrowRight />
                </Link>
              </div>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-6">
              {orders.map((order) => {
                const totalItemsCount = getOrderTotalItems(order.items);
                const formattedTotal = Number(order.totalAmount || 0).toLocaleString("en-IN");
                const displayId = (order.orderId || "").length > 16
                  ? (order.orderId || "").substring(0, 16) + "..."
                  : order.orderId;

                return (
                  <div
                    key={order.orderId}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl hover:border-zinc-700 transition space-y-6"
                  >
                    {/* Top Order Overview Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center pb-4 border-b border-zinc-800 text-sm">
                      <div className="col-span-2 md:col-span-2">
                        <span className="text-xs uppercase font-bold text-zinc-500 block mb-1">
                          Order ID
                        </span>
                        <span className="font-mono font-bold text-white text-xs bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 inline-block" title={order.orderId}>
                          #{displayId}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs uppercase font-bold text-zinc-500 block mb-1 flex items-center gap-1">
                          <FaCalendarAlt className="text-zinc-400" /> Date
                        </span>
                        <span className="text-zinc-300 text-xs">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs uppercase font-bold text-zinc-500 block mb-1">
                          Items
                        </span>
                        <span className="text-zinc-300 font-semibold text-xs">
                          {totalItemsCount} {totalItemsCount === 1 ? "Product" : "Products"}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs uppercase font-bold text-zinc-500 block mb-1">
                          Total Amount
                        </span>
                        <span className="font-extrabold text-red-400 text-base">
                          ₹{formattedTotal}
                        </span>
                      </div>

                      <div className="col-span-2 md:col-span-1 text-right flex md:flex-col items-center md:items-end justify-between gap-2">
                        {renderPaymentBadge(order)}
                        {renderStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Product Preview Items Row */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 overflow-x-auto py-1 max-w-full">
                        {order.items?.slice(0, 3).map((item, idx) => {
                          const img = item.product?.image || DEFAULT_PLACEHOLDER;
                          const name = item.product?.name || item.orderItemsCol || "Game Product";

                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 min-w-[200px]"
                            >
                              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                                <img
                                  src={img}
                                  alt={name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_PLACEHOLDER;
                                  }}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-white truncate" title={name}>
                                  {name}
                                </h4>
                                <span className="text-[11px] text-zinc-400">
                                  Qty: {item.quantity} × ₹{Number(item.pricePerUnit || item.product?.price || 0).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {order.items?.length > 3 && (
                          <div className="bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 flex items-center justify-center">
                            +{order.items.length - 3} More
                          </div>
                        )}
                      </div>

                      {/* View Details Action Button */}
                      <button
                        onClick={() => handleOpenDetails(order)}
                        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-blue-400 font-semibold px-4 py-2.5 rounded-xl transition text-xs border border-zinc-700 flex-shrink-0"
                      >
                        <FaEye /> View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaBoxOpen className="text-red-500" /> Order Details
                </h3>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  #{selectedOrder.orderId}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition p-2 rounded-lg hover:bg-zinc-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Order Status & Payment Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-2">
                    <FaCalendarAlt className="text-red-500" /> Order Information
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Order Date:</span>
                    <span className="text-white font-medium">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Fulfillment Status:</span>
                    <div>{renderStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-2">
                    <FaCreditCard className="text-blue-500" /> Payment Status
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Payment Status:</span>
                    <div>{renderPaymentBadge(selectedOrder)}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Payment ID:</span>
                    <span className="font-mono text-zinc-300 font-bold">
                      {selectedOrder.razorpayPaymentId || "N/A (Pending)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ordered Products Table */}
              <div>
                <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-3">
                  Ordered Products ({selectedOrder.items?.length || 0})
                </h4>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-zinc-900 text-zinc-400 text-xs uppercase border-b border-zinc-800">
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4 text-center">Quantity</th>
                        <th className="py-3 px-4 text-right">Price</th>
                        <th className="py-3 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {selectedOrder.items?.map((item, idx) => {
                        const img = item.product?.image || DEFAULT_PLACEHOLDER;
                        const name = item.product?.name || item.orderItemsCol || "Game Product";
                        const price = Number(item.pricePerUnit || item.product?.price || 0).toLocaleString("en-IN");
                        const total = Number(item.totalPrice || 0).toLocaleString("en-IN");

                        return (
                          <tr key={idx}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  <img
                                    src={img}
                                    alt={name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = DEFAULT_PLACEHOLDER;
                                    }}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <span className="font-semibold text-white text-xs max-w-xs truncate">
                                  {name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-zinc-300">
                              x{item.quantity}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-zinc-300">
                              ₹{price}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-white">
                              ₹{total}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-300">Total Order Amount</span>
                <span className="text-2xl font-extrabold text-red-500">
                  ₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <button
                onClick={() => generateInvoicePdf(selectedOrder)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm shadow-lg shadow-red-600/30"
              >
                <FaFileDownload /> Download Invoice (PDF)
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Orders;
