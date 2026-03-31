import DashboardSkeleton from "@/components/DashboardSkeleton";

/**
 * Global Loading State
 * Next.js App Router uses this file to show a fallback UI 
 * during route transitions. By using DashboardSkeleton here, 
 * we ensure that navigating between sections (Vault, Focus Room, etc.)
 * feels smooth and professional.
 */
export default function Loading() {
  return <DashboardSkeleton />;
}
