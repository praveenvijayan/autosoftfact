import { memo } from "react";

interface EmptyStateProps {
  message: string;
  description?: string;
}

export const EmptyState = memo(function EmptyState({
  message,
  description,
}: EmptyStateProps) {
  return (
    <div
      aria-live="polite"
      className="flex flex-col items-center justify-center py-3xl text-center"
    >
      {/* Minimal illustration */}
      <div className="text-4xl mb-md select-none" aria-hidden="true">
        ✓
      </div>
      <p className="text-base font-medium text-text-secondary">{message}</p>
      {description && (
        <p className="text-sm text-text-secondary mt-xs opacity-75">
          {description}
        </p>
      )}
    </div>
  );
});
