import { Link } from "react-router-dom";

const BUTTON_VARIANTS = {
  primary: "ui-dark hover:bg-[var(--primary-hover)]",
  secondary: "border border-[var(--border)] bg-white text-[var(--text)] hover:bg-zinc-50",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-zinc-100",
};

export function Button({
  children,
  className = "",
  disabled = false,
  href,
  onClick,
  variant = "primary",
  ...props
}) {
  const variantClass = BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary;
  const classes = [
    "inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-sm font-bold transition",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variantClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link aria-disabled={disabled} className={classes} to={disabled ? "#" : href} {...props}>
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
