import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { Button } from "@/components/ui/button";
import { 
  Layout, 
  ClipboardCheck, 
  FileSignature, 
  Receipt, 
  LogOut 
} from "lucide-react";

type CustomerLayoutProps = {
  children: ReactNode;
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout } = useCustomerAuth();
  const [location, setLocation] = useLocation();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/customer/auth");
    }
  }, [user, setLocation]);
  
  const handleLogout = async () => {
    await logout();
    setLocation("/customer/auth");
  };
  
  if (!user) {
    return null; // Don't render if not logged in
  }
  
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Customer Portal</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-6 border-b">
            <nav className="flex space-x-6 overflow-x-auto">
              <NavLink href="/customer/dashboard" isActive={location === "/customer/dashboard"}>
                <Layout className="h-4 w-4 mr-2" />
                Dashboard
              </NavLink>
              <NavLink href="/customer/estimates" isActive={location === "/customer/estimates"}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Estimates
              </NavLink>
              <NavLink href="/customer/contracts" isActive={location === "/customer/contracts"}>
                <FileSignature className="h-4 w-4 mr-2" />
                Contracts
              </NavLink>
              <NavLink href="/customer/invoices" isActive={location === "/customer/invoices"}>
                <Receipt className="h-4 w-4 mr-2" />
                Invoices
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

// Navigation Link Component
function NavLink({ 
  href, 
  isActive, 
  children 
}: { 
  href: string; 
  isActive: boolean; 
  children: React.ReactNode 
}) {
  const [, setLocation] = useLocation();
  
  return (
    <button
      onClick={() => setLocation(href)}
      className={`inline-flex items-center px-1 py-3 border-b-2 text-sm font-medium whitespace-nowrap ${
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}