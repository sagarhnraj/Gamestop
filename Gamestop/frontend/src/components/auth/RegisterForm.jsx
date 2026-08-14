import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../common/Input";
import GoogleLoginButton from "./GoogleLoginButton";
import { googleLogin } from "../../services/authService";
import { FcGoogle } from "react-icons/fc";

function RegisterForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    setErrors({
      ...errors,
      [field]: "",
    });
    setApiError("");
    setInfoMessage("");
  };

  const processGoogleCredential = async (idToken) => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) newErrors.email = "Enter a valid email address";

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setApiError("");
      setInfoMessage("Verifying Google ID Token with GameStop backend...");

      const payload = {
        idToken,
        enteredEmail: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };

      const data = await googleLogin(payload);

      if (data.token) {
        localStorage.setItem("token", String(data.token));
        if (data.userId) localStorage.setItem("userId", String(data.userId));
        if (data.username) localStorage.setItem("username", String(data.username));

        alert("Google Verification Successful! Welcome to GameStop.");
        navigate("/");
      } else {
        setApiError("Authentication failed: No token returned.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setApiError(err.message || "Google Verification failed.");
    } finally {
      setLoading(false);
      setInfoMessage("");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) newErrors.email = "Enter a valid email";
    if (formData.password && formData.password.length < 6) newErrors.password = "Minimum 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
      } else {
        setInfoMessage("Registration details validated! Please click 'Continue with Google' below to complete account creation.");
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900 rounded-xl p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-center text-white mb-2">
        Create Account
      </h1>

      <p className="text-center text-zinc-400 mb-6">
        Join GameStop with Google Verification
      </p>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-4">
          {apiError}
        </div>
      )}

      {infoMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-3 rounded-lg text-sm mb-4">
          {infoMessage}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4 mb-6">
        <Input
          label="First Name"
          placeholder="John"
          value={formData.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          error={errors.firstName}
          disabled={loading}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          value={formData.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          error={errors.lastName}
          disabled={loading}
        />
        <Input
          label="Email"
          type="email"
          placeholder="john@email.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          disabled={loading}
        />
        <Input
          label="Password"
          type="password"
          placeholder="********"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
          disabled={loading}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="********"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
          disabled={loading}
        />

        {/* Primary Red Action Button explicitly labeled 'Continue with Google' */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg text-base cursor-pointer"
        >
          <FcGoogle className="text-2xl bg-white rounded-full p-0.5" />
          <span>{loading ? "Verifying Google Identity..." : "Continue with Google"}</span>
        </button>
      </form>

      {/* Render Google Identity Services Component */}
      <div className="space-y-2">
        <GoogleLoginButton onCredentialResponse={processGoogleCredential} />
      </div>

      <p className="text-center text-zinc-400 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-red-500 hover:text-red-400">
          Login
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;