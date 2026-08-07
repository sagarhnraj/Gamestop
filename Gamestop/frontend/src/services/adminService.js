import API_BASE_URL from "./api";

const getToken = () => {
  const token = localStorage.getItem("token");
  return token && token !== "null" && token !== "undefined" ? token : null;
};

export async function getAdminStats() {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch admin dashboard statistics");
  }

  return await response.json();
}
