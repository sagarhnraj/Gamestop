import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { login } from "../services/authService";
import { FaShieldAlt } from "react-icons/fa";

import API_BASE_URL from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const data = await login(formData);
      console.log("Admin Login Payload Received:", data);

      if (data.token) {
        let isAuthorized = false;

        // 1. Check role property directly from login response
        const userRole = (data.role || "").toUpperCase();
        if (userRole === "ROLE_ADMIN" || userRole === "ADMIN" || userRole.includes("ADMIN")) {
          isAuthorized = true;
        }

        // 2. Verify live against backend admin endpoint
        if (!isAuthorized) {
          try {
            const checkRes = await fetch(`${API_BASE_URL}/admin/check`, {
              headers: {
                Authorization: `Bearer ${data.token}`,
              },
            });
            if (checkRes.ok) {
              isAuthorized = true;
            }
          } catch (err) {
            console.error("Live admin check endpoint error:", err);
          }
        }

        if (isAuthorized) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("username", data.username);
          localStorage.setItem("role", data.role || "ROLE_ADMIN");
          navigate("/admin/dashboard");
        } else {
          const roleDisplay = data.role ? `'${data.role}'` : "'CUSTOMER' / null";
          setAuthError(
            `Access Denied: Account '${formData.email}' has role ${roleDisplay}. If you recently updated the database row, please restart your Spring Boot backend so it reloads your updated user role.`
          );
        }
      } else {
        setAuthError("Invalid credentials.");
      }
    } catch (error) {
      console.error("Login submission error:", error);
      setAuthError(error.message || "Admin login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30 text-2xl">
            <FaShieldAlt />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-zinc-400 text-sm">
            Sign in with an authorized administrator account
          </p>
        </div>

        {authError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@gamestop.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              setErrors({ ...errors, email: "" });
            }}
            error={errors.email}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setErrors({ ...errors, password: "" });
            }}
            error={errors.password}
          />

          <Button
            text={loading ? "Authenticating..." : "Sign In to Admin Portal"}
            type="submit"
          />
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
