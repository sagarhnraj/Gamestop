import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function generateInvoicePdf(order, currentUser = {}) {
  if (!order) return;

  const doc = jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const orderId = order.orderId || "UNKNOWN";
  const customerName =
    order.customerName ||
    currentUser.username ||
    localStorage.getItem("username") ||
    "Valued Customer";
  const customerEmail =
    order.customerEmail ||
    currentUser.email ||
    "N/A";
  const userId = order.userId || localStorage.getItem("userId") || "N/A";

  const orderDateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");

  const paymentId = order.razorpayPaymentId || "N/A (Pending)";
  const paymentMethod = order.paymentMethod || "Razorpay / Online";
  const paymentStatus = (order.paymentStatus || "PAID").toUpperCase();
  const orderStatus = (order.status || "CONFIRMED").toUpperCase();

  // Color Palette (GameStop Theme: Dark Red #DC2626, Dark #18181B, Gray #71717A)
  const PRIMARY_RED = [220, 38, 38];
  const DARK_BG = [24, 24, 27];
  const TEXT_DARK = [39, 39, 42];
  const LIGHT_GRAY = [244, 244, 245];

  // 1. BRAND HEADER BAR (Red accent line & dark banner)
  doc.setFillColor(...PRIMARY_RED);
  doc.rect(0, 0, 210, 8, "F");

  doc.setFillColor(...DARK_BG);
  doc.rect(0, 8, 210, 32, "F");

  // GameStop Logo/Text Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("GAMESTOP", 15, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(239, 68, 68);
  doc.text("Gaming Store", 15, 31);

  // TAX INVOICE Header Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("TAX INVOICE", 195, 23, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(212, 212, 216);
  doc.text(`Invoice No: INV-${orderId.substring(0, 10)}`, 195, 29, { align: "right" });
  doc.text(`Date: ${orderDateStr}`, 195, 34, { align: "right" });

  // 2. CUSTOMER & ORDER DETAILS SECTION
  let y = 48;

  // Left Column: Customer Info
  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(14, y, 88, 36, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_RED);
  doc.text("BILLED TO:", 18, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);
  doc.text(String(customerName), 18, y + 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(113, 113, 122);
  doc.text(`Email: ${customerEmail}`, 18, y + 19);
  doc.text(`User ID: #${userId}`, 18, y + 24);
  doc.text("Address: Standard Home Delivery", 18, y + 29);

  // Right Column: Order Info
  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(108, y, 88, 36, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_RED);
  doc.text("ORDER SUMMARY:", 112, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`Order ID: #${orderId}`, 112, y + 13);
  doc.text(`Payment ID: ${paymentId}`, 112, y + 18);
  doc.text(`Payment Method: ${paymentMethod}`, 112, y + 23);
  doc.text(`Payment Status: ${paymentStatus}`, 112, y + 28);
  doc.text(`Order Status: ${orderStatus}`, 112, y + 33);

  // 3. PRODUCT ITEMS TABLE
  y += 42;

  const tableBody = (order.items || []).map((item, index) => {
    const productName =
      item.productName ||
      item.product?.name ||
      item.orderItemsCol ||
      "Gaming Product";

    const qty = item.quantity || 1;
    const pricePerUnit = Number(item.pricePerUnit || item.product?.price || 0);
    const totalPrice = Number(item.totalPrice || pricePerUnit * qty);

    return [
      index + 1,
      productName,
      qty,
      `₹ ${pricePerUnit.toLocaleString("en-IN")}`,
      `₹ ${totalPrice.toLocaleString("en-IN")}`,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["#", "Product Description", "Qty", "Unit Price", "Total Amount"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: PRIMARY_RED,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 95 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 4,
      textColor: TEXT_DARK,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  // 4. FINANCIAL SUMMARY (Subtotal, GST 18%, Grand Total)
  const finalY = doc.lastAutoTable.finalY + 8;
  const grandTotalNum = Number(order.totalAmount || 0);
  const subtotalNum = grandTotalNum / 1.18;
  const gstNum = grandTotalNum - subtotalNum;

  const summaryX = 120;
  const summaryWidth = 76;

  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(summaryX, finalY, summaryWidth, 32, 3, 3, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_DARK);

  doc.text("Subtotal (Excl. Tax):", summaryX + 5, finalY + 8);
  doc.text(`₹ ${subtotalNum.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, summaryX + summaryWidth - 5, finalY + 8, { align: "right" });

  doc.text("GST (18% Included):", summaryX + 5, finalY + 15);
  doc.text(`₹ ${gstNum.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, summaryX + summaryWidth - 5, finalY + 15, { align: "right" });

  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 212, 216);
  doc.line(summaryX + 4, finalY + 19, summaryX + summaryWidth - 4, finalY + 19);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_RED);
  doc.text("Grand Total:", summaryX + 5, finalY + 26);
  doc.text(`₹ ${grandTotalNum.toLocaleString("en-IN")}`, summaryX + summaryWidth - 5, finalY + 26, { align: "right" });

  // 5. FOOTER
  const footerY = 275;
  doc.setLineWidth(0.5);
  doc.setDrawColor(228, 228, 231);
  doc.line(15, footerY - 5, 195, footerY - 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_RED);
  doc.text("Thank you for shopping with GameStop!", 105, footerY, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(161, 161, 170);
  doc.text(
    "This is a computer-generated invoice and does not require a physical signature.",
    105,
    footerY + 4,
    { align: "center" }
  );
  doc.text("GameStop Retail Operations India Pvt Ltd • Support: support@gamestop.com", 105, footerY + 8, { align: "center" });

  // 6. SAVE AND DOWNLOAD PDF
  const sanitizeFilename = String(orderId).replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`Invoice_${sanitizeFilename}.pdf`);
}
