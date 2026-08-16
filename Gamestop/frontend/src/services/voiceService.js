import API_BASE_URL from "./api";

export const processVoiceQuery = async (queryText) => {
  try {
    const response = await fetch(`${API_BASE_URL}/voice/assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: queryText }),
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
