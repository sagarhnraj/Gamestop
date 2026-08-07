import API_BASE_URL from "./api";

export async function login(data) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  return await response.json();
}

export async function initiateRegistration(data) {
  const response = await fetch(`${API_BASE_URL}/auth/register/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  if (!response.ok || !responseData.success) {
    throw new Error(responseData.message || "Registration initiation failed");
  }

  return responseData;
}

export async function verifyOtp(data) {
  const response = await fetch(`${API_BASE_URL}/auth/register/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  if (!response.ok || !responseData.success) {
    throw new Error(responseData.message || "OTP verification failed");
  }

  return responseData;
}

export async function resendOtp(email) {
  const response = await fetch(`${API_BASE_URL}/auth/register/resend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const responseData = await response.json();
  if (!response.ok || !responseData.success) {
    throw new Error(responseData.message || "Failed to resend OTP");
  }

  return responseData;
}
