import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../common/Input";
import Button from "../common/Button";
import GoogleLoginButton from "./GoogleLoginButton";
import { login } from "../../services/authService";

function LoginForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);

        alert("Login Successful");
        navigate("/");
      } else {
        alert("Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Login Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Google Sign In */}
      <GoogleLoginButton />

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-zinc-800 w-full"></div>
        <span className="bg-zinc-950 px-3 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
          Or sign in with email
        </span>
        <div className="border-t border-zinc-800 w-full"></div>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => {
            setFormData({
              ...formData,
              email: e.target.value,
            });
            setErrors({
              ...errors,
              email: "",
            });
          }}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => {
            setFormData({
              ...formData,
              password: e.target.value,
            });
            setErrors({
              ...errors,
              password: "",
            });
          }}
          error={errors.password}
        />

        <Button
          text={loading ? "Signing In..." : "Sign In"}
          type="submit"
        />
      </form>
    </div>
  );
}

export default LoginForm;