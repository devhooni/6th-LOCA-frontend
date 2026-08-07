import { Link } from "react-router-dom";

const variants = {
  primary: "ui-dark hover:bg-[var(--primary-hover)]",
  secondary:
    "border border-[var(--border)] bg-white text-[var(--text)] hover:bg-zinc-50",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-zinc-100",
};

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  ...props
}) {
  const classes = `inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-sm font-bold transition ${variants[variant]} ${
    disabled ? "cursor-not-allowed opacity-60" : ""
  } ${className}`;

  if (href) {
    return (
      <Link className={classes} to={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} onClick={onClick} type="button" {...props}>
      {children}
    </button>
  );
}
