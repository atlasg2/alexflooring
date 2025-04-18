import { useEffect } from "react";
import { Route, useLocation } from "wouter";
import { useSimpleAuth } from "@/hooks/use-simple-auth";
import { Loader2 } from "lucide-react";

interface SimpleProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  adminOnly?: boolean;
}

export default function SimpleProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
}: SimpleProtectedRouteProps) {
  const { user, isLoading } = useSimpleAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Not logged in, redirect to login
      navigate("/admin/login");
    } else if (!isLoading && adminOnly && user?.role !== "admin") {
      // Not an admin, redirect to home
      navigate("/");
    }
  }, [user, isLoading, navigate, adminOnly]);

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : user && (!adminOnly || user.role === "admin") ? (
        <Component />
      ) : null}
    </Route>
  );
}