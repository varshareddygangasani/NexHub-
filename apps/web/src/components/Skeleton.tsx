import { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * Apple-style shimmering skeleton block.
 * Use width/height via Tailwind classes (e.g. "h-4 w-32") or inline style.
 */
export function Skeleton({ className = '', style, rounded = 'md' }: SkeletonProps) {
  const r =
    rounded === 'full'
      ? 'rounded-full'
      : rounded === '2xl'
      ? 'rounded-2xl'
      : rounded === 'xl'
      ? 'rounded-xl'
      : rounded === 'lg'
      ? 'rounded-lg'
      : rounded === 'sm'
      ? 'rounded-sm'
      : 'rounded-md';
  return (
    <span
      className={`skeleton-shimmer block ${r} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/** Convenience: a row of N text-line skeletons. */
export function SkeletonLines({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}

/** Convenience: a card skeleton (avatar + lines). */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`apple-card p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton rounded="full" className="w-10 h-10" />
        <div className="flex-1 flex flex-col gap-1.5">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2.5 w-1/4" />
        </div>
      </div>
      <SkeletonLines lines={3} />
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="h-6 w-16" rounded="full" />
        <Skeleton className="h-6 w-16" rounded="full" />
      </div>
    </div>
  );
}
