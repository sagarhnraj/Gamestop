import API_BASE_URL from "./api";

const getUserId = () => {
  const id = localStorage.getItem("userId");
  return id && id !== "null" && id !== "undefined" ? id : null;
};

const getToken = () => {
  const token = localStorage.getItem("token");
  return token && token !== "null" && token !== "undefined" ? token : null;
};

export async function createPaymentOrder() {
  const userId = getUserId();
  const token = getToken();

  if (!userId || !token) {
    throw new Error("Please log in to place an order");
  }

  const response = await fetch(
    `${API_BASE_URL}/orders/${userId}/create-payment`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to start payment");
  }

  return await response.json();
}

export async function verifyPayment(payload) {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in to complete payment");
  }

  const response = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Payment verification failed");
  }

  return await response.json();
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function getOrders() {
  const userId = getUserId();
  const token = getToken();

  if (!userId || !token) {
    throw new Error("Please log in to view your orders");
  }

  const response = await fetch(`${API_BASE_URL}/orders/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load orders");
  }

  return await response.json();
}

export async function getAllOrdersForAdmin() {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/orders/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to load orders");
  }

  return await response.json();
}

export async function getOrderDetailsForAdmin(orderId) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/orders/details/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to fetch order details");
  }

  return await response.json();
}

export async function updateOrderStatus(orderId, status) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to update order status");
  }

  return await response.json();
}
