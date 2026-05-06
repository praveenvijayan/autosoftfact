import Link from "next/link";

const NAV_ITEMS = [
  { label: "My Todos", href: "/" },
];

/**
 * Sidebar — minimal text-only navigation.
 * Active item: accent-soft background + accent-primary text (pill style).
 * Inactive items: text-secondary, soft hover.
 */
export function Sidebar() {
  return (
    <nav className="flex flex-col h-full px-md py-xl gap-xs">
      {/* App logo / name */}
      <div className="px-lg mb-xl">
        <span className="text-base font-bold text-text-primary tracking-tight">
          ParayMD
        </span>
        <p className="text-xs text-text-secondary mt-xs">Task workspace</p>
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className={[
            "px-lg py-sm rounded-pill text-sm font-medium",
            "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
            "focus:outline-none focus:ring-2 focus:ring-accent-primary",
            "transition-colors duration-150",
            // Active state applied via aria-current in a real app with usePathname
            // For now, always highlight the single item
            "bg-accent-soft text-accent-primary",
          ].join(" ")}
          aria-current="page"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
