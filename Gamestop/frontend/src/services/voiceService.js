import API_BASE_URL from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const processVoiceQuery = async (queryText, context = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/voice/assistant`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        query: queryText,
        currentPage: context.currentPage || "",
        currentProductId: context.currentProductId || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Voice Assistant Service Error:", error);
    throw error;
  }
};

export const getVoiceSuggestions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/voice/suggestions`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Server returned error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get Voice Suggestions Error:", error);
    return [];
  }
};
