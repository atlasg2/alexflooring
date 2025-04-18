import { useEffect } from "react";
import { Route, useLocation } from "wouter";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { Loader2 } from "lucide-react";

interface ProtectedCustomerRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedCustomerRoute({
  path,
  component: Component,
}: ProtectedCustomerRouteProps) {
  const { user, isLoading } = useCustomerAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/customer/auth");
    }
  }, [user, isLoading, setLocation]);

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : user ? (
        <Component />
      ) : null}
    </Route>
  );
}