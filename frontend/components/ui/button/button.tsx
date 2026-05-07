import "@/app/globals.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
};

function Button({
  children,
  onClick,
  icon,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  type = "button",
}: ButtonProps) {
  const sizeClass =
    size === "sm" ? "hr-btn--sm" : size === "lg" ? "hr-btn--lg" : "";

  return (
    <button
      className={`hr-btn hr-btn--${variant} ${sizeClass} ${fullWidth ? "w-full" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <span className="hr-btn__spinner" /> : icon && icon}
      {children}
    </button>
  );
}

export default Button;
