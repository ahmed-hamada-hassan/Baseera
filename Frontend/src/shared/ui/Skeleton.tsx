export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-700/30 animate-pulse rounded ${className}`} />;
}
