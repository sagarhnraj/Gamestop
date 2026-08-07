import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../common/Input";
import Button from "../common/Button";
import { initiateRegistration, verifyOtp, resendOtp } from "../../services/authService";

function RegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  
  // Registration data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // OTP state
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(60);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let timer;
    if (step === 2 && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldown]);

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

  const handleInitiate = async (e) => {
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
        await initiateRegistration(formData);
        setStep(2);
        setCooldown(60);
      } catch (err) {
        setApiError(err.message || "Failed to initiate registration");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP" });
      return;
    }

    try {
      setLoading(true);
      setApiError("");
      await verifyOtp({ email: formData.email, otp });
      // Verification success
      navigate("/login", { state: { message: "Registration successful. Please login." } });
    } catch (err) {
      setApiError(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      setLoading(true);
      setApiError("");
      await resendOtp(formData.email);
      setCooldown(60);
    } catch (err) {
      setApiError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900 rounded-xl p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-center text-white mb-2">
        {step === 1 ? "Create Account" : "Verify Email"}
      </h1>

      <p className="text-center text-zinc-400 mb-6">
        {step === 1 ? "Join GameStop today" : `Enter the OTP sent to ${formData.email}`}
      </p>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-4">
          {apiError}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleInitiate} className="space-y-4">
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
          <Button text={loading ? "Please wait..." : "Register"} type="submit" disabled={loading} />
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="OTP Code"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setErrors({ ...errors, otp: "" });
              setApiError("");
            }}
            error={errors.otp}
            maxLength={6}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="flex justify-between items-center text-sm mt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-zinc-400 hover:text-white"
            >
              Change Email
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || loading}
              className={`${
                cooldown > 0 ? "text-zinc-600" : "text-red-500 hover:text-red-400"
              }`}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      {step === 1 && (
        <p className="text-center text-zinc-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 hover:text-red-400">
            Login
          </Link>
        </p>
      )}
    </div>
  );
}

export default RegisterForm;