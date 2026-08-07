import API_BASE_URL from "./api";

export async function getAllCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return await response.json();
}
