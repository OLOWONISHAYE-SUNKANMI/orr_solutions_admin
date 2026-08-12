import { DashboardSkeleton } from "@/app/components/ui/SkeletonPresets";

// Route-level loading UI for the admin dashboard route group. Next.js shows
// this via a Suspense boundary while a dashboard route is navigating/mounting.
// Individual pages additionally render their own skeletons during client-side
// data fetches.
export default function Loading() {
  return <DashboardSkeleton />;
}
