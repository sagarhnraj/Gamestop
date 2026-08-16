import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../common/Input";
import GoogleLoginButton from "./GoogleLoginButton";
import { googleLogin } from "../../services/authService";
import { FaCheckCircle } from "react-icons/fa";

function RegisterForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processGoogleCredential = async (idToken) => {
    if (!validateForm()) {
      setApiError("Please fix the validation errors in the registration form before verifying with Google.");
      return;
    }

    try {
      setLoading(true);
      setApiError("");
      setInfoMessage("Verifying Google ID Token & creating account...");

      const payload = {
        idToken,
        enteredEmail: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password.trim(),
      };

      const data = await googleLogin(payload);

      if (data && (data.token || data.userId || data.message)) {
        // DO NOT store tokens in localStorage (No automatic login!)
        setShowSuccessModal(true);
      } else {
        setApiError("Registration failed: Invalid response from backend.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setApiError(err.message || "Google Verification failed.");
    } finally {
      setLoading(false);
      setInfoMessage("");
    }
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  return (
    <div className="w-full max-w-md bg-zinc-900 rounded-xl p-8 shadow-xl relative">
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

      <div className="space-y-4 mb-6">
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
      </div>

      {/* Exactly ONE Google Button rendered */}
      <div className="mb-6">
        <GoogleLoginButton
          onCredentialResponse={processGoogleCredential}
          disabled={loading}
        />
      </div>

      <p className="text-center text-zinc-400 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-red-500 hover:text-red-400 font-semibold">
          Login
        </Link>
      </p>

      {/* Registration Success Modal Popup */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl space-y-5">
            <FaCheckCircle className="text-emerald-500 text-6xl mx-auto" />
            
            <h2 className="text-2xl font-bold text-white">
              Account Created Successfully!
            </h2>
            
            <p className="text-zinc-300 text-sm leading-relaxed">
              Your account has been created successfully. You can now log in with your email and password.
            </p>
            
            <button
              type="button"
              onClick={handleGoToLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterForm;