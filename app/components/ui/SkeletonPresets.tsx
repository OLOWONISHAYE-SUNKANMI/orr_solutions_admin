import React from "react";
import Skeleton from "@/app/components/ui/Skeleton";

/**
 * Composed skeleton-loading layouts built on the base <Skeleton> primitive.
 *
 * These mirror the shape of real content (stat tiles, tables, lists, cards)
 * while data is being fetched. They affect ONLY a page's loading state — never
 * its data, its fetch logic, or the UI shown once data has arrived.
 *
 * Usage:
 *   if (isLoading) return <DashboardSkeleton />;
 *   {isLoading ? <SkeletonTable rows={6} cols={5} /> : <RealTable data={rows} />}
 */

/** A responsive row of KPI / stat tiles. */
export function SkeletonStatCards({
  count = 4,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-secondary/40 bg-white/5 p-5 flex flex-col gap-3"
        >
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-7 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/** A table with a header row and shimmer body rows. */
export function SkeletonTable({
  rows = 6,
  cols = 4,
  className = "",
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-secondary/40 ${className}`}
    >
      <div className="flex gap-4 bg-white/5 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex gap-4 px-4 py-4 border-t border-secondary/20"
          >
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={`h-4 flex-1 ${c === 0 ? "max-w-[40%]" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A vertical list of line items (notifications, messages, activity). */
export function SkeletonList({
  rows = 5,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-secondary/40 bg-white/5 p-4"
        >
          <Skeleton variant="circle" width={40} height={40} className="shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-3 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** A responsive grid of content cards (projects, documents). */
export function SkeletonCardGrid({
  count = 6,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-secondary/40 bg-white/5 p-5 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/**
 * Generic full-page dashboard skeleton: heading, a row of stat tiles and a
 * table. Used by route-level loading.tsx files and any page whose layout is a
 * standard dashboard.
 */
export function DashboardSkeleton() {
  return (
    <div className="w-full p-6 md:p-8 flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <SkeletonStatCards count={4} />
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}

export default DashboardSkeleton;
