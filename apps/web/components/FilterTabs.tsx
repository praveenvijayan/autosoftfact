"use client";

import { memo } from "react";

export type Filter = "ALL" | "TODO" | "COMPLETE";

interface FilterOption {
  label: string;
  value: Filter;
  count: number;
}

interface FilterTabsProps {
  filters: FilterOption[];
  activeFilter: Filter;
  onChange: (filter: Filter) => void;
}

export const FilterTabs = memo(function FilterTabs({
  filters,
  activeFilter,
  onChange,
}: FilterTabsProps) {
  return (
    <div
      role="group"
      aria-label="Filter todos"
      className="flex gap-xs flex-wrap"
    >
      {filters.map(({ label, value, count }) => {
        const isActive = activeFilter === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={[
              "px-lg py-xs rounded-pill text-sm font-medium",
              "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-1",
              "transition-colors duration-150",
              isActive
                ? "bg-accent-primary text-white"
                : "bg-bg-surface text-text-secondary border border-border-default hover:bg-bg-hover",
            ].join(" ")}
          >
            {label} ({count})
          </button>
        );
      })}
    </div>
  );
});
