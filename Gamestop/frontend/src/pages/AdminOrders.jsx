import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import {
  getAllOrdersForAdmin,
  updateOrderStatus,
} from "../services/orderService";
import { generateInvoicePdf } from "../utils/generateInvoicePdf";
import {
  FaShoppingBag,
  FaSearch,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaBox,
  FaBan,
  FaCreditCard,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFileDownload,
} from "react-icons/fa";

const DEFAULT_PLACEHOLDER =
  "https://ik.imagekit.io/stringstackSG/Games%20Category.png";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");

  // Modals state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Selected Order for view/edit
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState({
    orderId: null,
    oldStatus: "",
    newStatus: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllOrdersForAdmin();
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load customer orders.");
    } finally {
      setLoading(false);
    }
  }

  // Filter orders by search & status
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.orderId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerEmail || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (o.status || "").toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Open Details Modal
  const handleOpenDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  // Trigger Status Change Confirmation
  const handleRequestStatusChange = (order, newStatus) => {
    if (order.status === newStatus) return;
    setSelectedOrder(order);
    setPendingStatusChange({
      orderId: order.orderId,
      oldStatus: order.status,
      newStatus: newStatus,
    });
    setIsConfirmModalOpen(true);
  };

  // Confirm Status Change
  const handleConfirmStatusChange = async () => {
    const { orderId, newStatus } = pendingStatusChange;
    if (!orderId || !newStatus) return;

    try {
      setSubmitting(true);
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      setIsConfirmModalOpen(false);

      // If details modal is open for this order, update selected order state
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(updatedOrder);
      }

      await fetchOrders();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.message || "Failed to update order status");
    } finally {
      setSubmitting(false);
    }
  };

  // Render Status Badge
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

  // Render Payment Badge
  const renderPaymentBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PAID") {
      return (
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
          PAID
        </span>
      );
    } else if (s === "CANCELLED") {
      return (
        <span className="bg-zinc-800 text-zinc-500 border border-zinc-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          CANCELLED
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaShoppingBag className="text-red-500 text-2xl" /> Order Management
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              View customer orders, inspect item details, and manage fulfillment statuses
            </p>
          </div>

          <div className="text-sm text-zinc-400 font-medium bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
            Total Customer Orders: <span className="text-white font-bold">{orders.length}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-700 flex-1 w-full md:max-w-md">
            <FaSearch className="text-zinc-400" />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-white text-sm w-full placeholder-zinc-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl outline-none focus:border-red-500"
            >
              <option value="ALL">ALL STATUSES</option>
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-zinc-400">Loading order records...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 flex flex-col items-center">
              <FaShoppingBag className="text-4xl text-zinc-600 mb-3" />
              <p className="font-semibold">No orders found</p>
              <p className="text-xs text-zinc-500 mt-1">Adjust search or status filters to view records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-800/80 text-zinc-300 border-b border-zinc-800 uppercase text-xs tracking-wider">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer Name</th>
                    <th className="py-4 px-6">Customer Email</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Payment Status</th>
                    <th className="py-4 px-6">Order Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredOrders.map((order) => {
                    const orderDateStr = formatDate(order.createdAt);
                    const formattedAmount = Number(order.totalAmount || 0).toLocaleString("en-IN");
                    const shortId = (order.orderId || "").length > 14
                      ? (order.orderId || "").substring(0, 14) + "..."
                      : order.orderId;

                    return (
                      <tr key={order.orderId} className="hover:bg-zinc-800/40 transition">
                        <td className="py-4 px-6 font-mono text-xs text-zinc-400 font-bold" title={order.orderId}>
                          #{shortId}
                        </td>
                        <td className="py-4 px-6 font-bold text-white">
                          {order.customerName || "Customer"}
                        </td>
                        <td className="py-4 px-6 text-zinc-400 text-xs font-mono">
                          {order.customerEmail || "N/A"}
                        </td>
                        <td className="py-4 px-6 text-zinc-400 text-xs">
                          {orderDateStr}
                        </td>
                        <td className="py-4 px-6 font-extrabold text-red-400">
                          ₹{formattedAmount}
                        </td>
                        <td className="py-4 px-6">
                          {renderPaymentBadge(order.paymentStatus)}
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={(order.status || "PENDING").toUpperCase()}
                            onChange={(e) => handleRequestStatusChange(order, e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:border-red-500"
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleOpenDetailsModal(order)}
                            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-blue-400 font-semibold px-3 py-2 rounded-xl transition text-xs ml-auto"
                          >
                            <FaEye /> View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaShoppingBag className="text-red-500" /> Order #{selectedOrder.orderId}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Placed on {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition p-2 rounded-lg hover:bg-zinc-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Customer Info & Status Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Card */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-2">
                    <FaUser className="text-red-500" /> Customer Information
                  </h4>
                  <div className="text-sm text-white font-bold">{selectedOrder.customerName || "Customer"}</div>
                  <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                    <FaEnvelope className="text-zinc-500" /> {selectedOrder.customerEmail}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">User ID: #{selectedOrder.userId || "Guest"}</div>
                </div>

                {/* Status & Payment Card */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-2">
                    <FaCreditCard className="text-blue-500" /> Payment & Status
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Fulfillment Status:</span>
                    <div>{renderStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Payment ID:</span>
                    <span className="font-mono text-zinc-300 font-bold">{selectedOrder.razorpayPaymentId || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Payment Method:</span>
                    <span className="text-zinc-300">{selectedOrder.paymentMethod || "Online Payment"}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-2 mb-2">
                  <FaMapMarkerAlt className="text-green-500" /> Shipping Address
                </h4>
                <p className="text-sm text-zinc-300">
                  {selectedOrder.shippingAddress || "Standard Shipping Address"}
                </p>
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
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Unit Price</th>
                        <th className="py-3 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {selectedOrder.items?.map((item, idx) => {
                        const img = item.productImage || DEFAULT_PLACEHOLDER;
                        const unitPrice = Number(item.pricePerUnit || 0).toLocaleString("en-IN");
                        const subtotal = Number(item.totalPrice || 0).toLocaleString("en-IN");

                        return (
                          <tr key={idx}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  <img
                                    src={img}
                                    alt={item.productName}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = DEFAULT_PLACEHOLDER;
                                    }}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <span className="font-semibold text-white text-xs max-w-xs truncate">
                                  {item.productName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-zinc-300">
                              x{item.quantity}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-zinc-300">
                              ₹{unitPrice}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-white">
                              ₹{subtotal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Order Summary */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-300">Total Order Amount</span>
                <span className="text-2xl font-extrabold text-red-500">
                  ₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Status Updater inside details */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase font-bold text-zinc-400">Update Order Status</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Select status and confirm to save changes</div>
                </div>

                <div className="flex items-center gap-2">
                  {ORDER_STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleRequestStatusChange(selectedOrder, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                        (selectedOrder.status || "").toUpperCase() === st
                          ? "bg-red-600 text-white border-red-500 shadow-md"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
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
                onClick={() => setIsDetailsModalOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM STATUS CHANGE MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-red-500/30">
              <FaTruck />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Update Order Status</h3>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
              Are you sure you want to update the status of Order{" "}
              <span className="text-white font-mono font-bold">#{pendingStatusChange.orderId}</span> from{" "}
              <span className="text-amber-400 font-bold">"{pendingStatusChange.oldStatus}"</span> to{" "}
              <span className="text-green-400 font-bold">"{pendingStatusChange.newStatus}"</span>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-red-600/30 text-sm disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Yes, Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminOrders;
