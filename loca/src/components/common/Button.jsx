import { Link } from "react-router-dom";

/**
 * Button — Reusable button with primary / secondary / ghost variants
 */
export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  ...props
}) {
  const variantClass =
    variant === "primary" ? "btn-primary" :
    variant === "secondary" ? "btn-secondary" :
    "btn-ghost";

  const classes = `btn ${variantClass} ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`;

  if (href) {
    return (
      <Link className={classes} to={href}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
