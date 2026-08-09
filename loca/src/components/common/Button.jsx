import { Link } from "react-router-dom";

export function Button({ children, href, variant = "primary", onClick, disabled = false, ...props }) {
  const cls = variant === "primary" ? "btn-primary" : "btn-secondary";
  if (href) return <Link to={href} className={cls}>{children}</Link>;
  return (
    <button className={cls} onClick={onClick} disabled={disabled} type="button" {...props}>
      {children}
    </button>
  );
}
