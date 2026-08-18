import API_BASE_URL from "./api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token && token !== "null" && token !== "undefined") {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function getAllProducts(retries = 3, delayMs = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn(`[getAllProducts] Fetch attempt ${attempt} failed:`, err);
    }
    if (attempt < retries) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  // Final fetch attempt
  const finalResponse = await fetch(`${API_BASE_URL}/products`, {
    headers: getAuthHeaders(),
  });

  if (!finalResponse.ok) {
    throw new Error("Failed to fetch products");
  }

  return await finalResponse.json();
}

export async function getProductById(id, retries = 2, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn(`[getProductById] Fetch attempt ${attempt} failed:`, err);
    }
    if (attempt < retries) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  const finalResponse = await fetch(`${API_BASE_URL}/products/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!finalResponse.ok) {
    throw new Error("Failed to fetch product");
  }

  return await finalResponse.json();
}

export async function createProduct(productData) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create product");
  }

  return await response.json();
}

export async function updateProduct(productId, productData) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update product");
  }

  return await response.json();
}

export async function deleteProduct(productId) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
}