function Button({
  text,
  children,
  type = "button",
  onClick,
  variant = "primary",
  fullWidth = true,
  size = "normal",
  disabled = false,
  className = "",
}) {
  const sizeStyles = {
    normal: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg font-bold",
  };

  const baseStyle =
    "font-semibold rounded-lg transition duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white",
    secondary:
      "border border-red-600 text-red-500 hover:bg-red-600 hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${sizeStyles[size] || sizeStyles.normal} ${
        variants[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {text || children}
    </button>
  );
}

export default Button;