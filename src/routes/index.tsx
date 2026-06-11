import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/auth/use-auth";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return <Navigate to="/dashboard" />;
}
