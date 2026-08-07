import API_BASE_URL from "./api";

const getUserId = () => {
  const id = localStorage.getItem("userId");
  return id && id !== "null" && id !== "undefined" ? id : null;
};

const getToken = () => {
  const token = localStorage.getItem("token");
  return token && token !== "null" && token !== "undefined" ? token : null;
};

const isLoggedIn = () => getUserId() !== null && getToken() !== null;

export async function getCart() {
  const userId = getUserId();

  if (!isLoggedIn()) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/cart/${userId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch cart");
  }

  return await response.json();
}

export async function addToCart(productId) {
  const userId = getUserId();

  if (!isLoggedIn()) {
    throw new Error("Please log in to add items to your cart");
  }

  const response = await fetch(
    `${API_BASE_URL}/cart/${userId}/${productId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add product");
  }

  return await response.json();
}

export async function updateQuantity(productId, quantity) {
  const userId = getUserId();

  if (!isLoggedIn()) {
    throw new Error("Please log in to update your cart");
  }

  const response = await fetch(
    `${API_BASE_URL}/cart/${userId}/${productId}/${quantity}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update quantity");
  }

  return await response.json();
}

export async function removeFromCart(productId) {
  const userId = getUserId();

  if (!isLoggedIn()) {
    throw new Error("Please log in to modify your cart");
  }

  const response = await fetch(
    `${API_BASE_URL}/cart/${userId}/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove item");
  }
}

export async function clearCart() {
  const userId = getUserId();

  if (!isLoggedIn()) {
    return;
  }

  const response = await fetch(`${API_BASE_URL}/cart/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to clear cart");
  }
}