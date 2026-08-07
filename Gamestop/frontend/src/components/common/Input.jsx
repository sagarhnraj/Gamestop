import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-sm font-medium text-gray-300">
        {label}
      </label>

      <div className="relative">
        <input
          type={
            type === "password"
              ? (showPassword ? "text" : "password")
              : type
  }
  placeholder={placeholder}
  value={value}
  onChange={onChange}
  className="w-full rounded-lg border border-gray-500 bg-transparent px-4 py-3 pr-12 text-white placeholder:text-gray-500 outline-none focus:border-violet-500"
/>

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;