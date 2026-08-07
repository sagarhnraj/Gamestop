import API_BASE_URL from "./api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function getAllProducts() {
  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return await response.json();
}

export async function getProductById(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return await response.json();
}