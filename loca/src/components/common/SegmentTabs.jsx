import { Link } from "react-router-dom";

export function SegmentTabs({ active }) {
  const tabs = [
    { key: "for-you", label: "ForYou", href: "/for-you" },
    { key: "explore", label: "Explore", href: "/explore" },
  ];

  return (
    <div className="flex items-center gap-6 border-b border-[var(--border)] px-5">
      {tabs.map((tab) => (
        <Link
          className={`relative pb-3 pt-5 text-lg font-bold ${
            active === tab.key ? "text-[var(--brand)]" : "text-zinc-300"
          }`}
          to={tab.href}
          key={tab.key}
        >
          {tab.label}
          {active === tab.key ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--brand)]" />
          ) : null}
        </Link>
      ))}
    </div>
  );
}
