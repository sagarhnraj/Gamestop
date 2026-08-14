import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../common/Input";
import Button from "../common/Button";
import GoogleLoginButton from "./GoogleLoginButton";
import { registerDirect } from "../../services/authService";

function RegisterForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Minimum 6 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        setApiError("");
        const data = await registerDirect(formData);

        if (data.token) {
          localStorage.setItem("token", String(data.token));
          if (data.userId) localStorage.setItem("userId", String(data.userId));
          if (data.username) localStorage.setItem("username", String(data.username));

          alert("Registration Successful!");
          navigate("/");
        } else {
          navigate("/login", { state: { message: "Registration successful. Please login." } });
        }
      } catch (err) {
        setApiError(err.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900 rounded-xl p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-center text-white mb-2">
        Create Account
      </h1>

      <p className="text-center text-zinc-400 mb-6">
        Join GameStop today
      </p>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-4">
          {apiError}
        </div>
      )}

      {/* Google Sign-In Primary Verified Method */}
      <div className="mb-6">
        <GoogleLoginButton />
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="border-t border-zinc-800 w-full"></div>
        <span className="bg-zinc-900 px-3 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
          Or register with email
        </span>
        <div className="border-t border-zinc-800 w-full"></div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          label="First Name"
          placeholder="John"
          value={formData.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          error={errors.firstName}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          value={formData.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          error={errors.lastName}
        />
        <Input
          label="Email"
          type="email"
          placeholder="john@email.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="********"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="********"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
        />
        <Button text={loading ? "Creating Account..." : "Register"} type="submit" disabled={loading} />
      </form>

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