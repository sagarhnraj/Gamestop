import API_BASE_URL from "./api";

async function parseResponse(response) {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { message: text };
  }

  if (!response.ok) {
    const errorMsg = data.message || (typeof data === "string" ? data : "Request failed");
    throw new Error(errorMsg);
  }

  return data;
}

export async function login(data) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await parseResponse(response);
}

export async function googleLogin(payload) {
  // payload can be a string (idToken) or object ({ idToken, enteredEmail, firstName, lastName })
  const bodyData = typeof payload === "string" ? { idToken: payload } : payload;

  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData),
  });

  return await parseResponse(response);
}
