import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { trackComponentLifecycle } from "@/utils/performance";

// Types
type CustomerUser = {
  id: number;
  email: string;
  username: string;
  name: string;
  phone?: string;
  lastLogin?: string;
  isCustomer: boolean;
};

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  name: string;
  phone?: string;
};

type CustomerAuthContextType = {
  user: CustomerUser | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<CustomerUser>;
  register: (data: RegisterData) => Promise<CustomerUser>;
  logout: () => Promise<void>;
};

// Context
const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

// Provider
export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pathChecked, setPathChecked] = useState(false);
  
  // Keep track of active timeouts to clean them up
  const timeoutRefs = useRef<number[]>([]);
  
  // Use performance tracking to monitor component lifecycle
  useEffect(() => {
    return trackComponentLifecycle('CustomerAuthProvider', () => {
      console.log('CustomerAuthProvider mounted');
      setPathChecked(true);
    }, () => {
      console.log('CustomerAuthProvider unmounting - cleaning up resources');
      // Clean up any timeouts
      timeoutRefs.current.forEach(timerId => window.clearTimeout(timerId));
      timeoutRefs.current = [];
      
      // Help garbage collection
      queryClient.cancelQueries({ queryKey: ["/api/customer/me"] });
    });
  }, []);
  
  // Route-based query enabling
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isCustomerRoute = pathname.startsWith('/customer');
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<CustomerUser | null, Error>({
    queryKey: ["/api/customer/me"],
    queryFn: async () => {
      try {
        // Only run this query on customer routes to avoid unnecessary auth checks
        if (!isCustomerRoute) {
          return null;
        }
        
        const res = await apiRequest("GET", "/api/customer/me");
        if (res.ok) {
          return res.json();
        }
        
        // Silently return null for unauthenticated users (401 error)
        return null;
      } catch (error) {
        // Don't log errors for expected auth failures
        if (error instanceof Error && !error.message.includes("401")) {
          // Only log unexpected errors
          console.error("Unexpected error in customer auth:", error);
        }
        return null;
      }
    },
    // Reduce refetch attempts for unauthenticated users
    retry: false,
    // Disable the query by default, only enable for customer routes
    enabled: isCustomerRoute && pathChecked,
    // Completely disable automatic refetching
    refetchInterval: false,
    refetchOnWindowFocus: false,
    // Increase cache time to reduce re-fetching
    staleTime: 300000, // 5 minutes
    gcTime: 600000 // 10 minutes
  });

  const login = async (credentials: LoginCredentials): Promise<CustomerUser> => {
    try {
      // Create a timeout to automatically cancel request after 10 seconds
      const timeoutId = window.setTimeout(() => {
        console.warn('Customer login request timed out');
        toast({
          title: "Login timeout",
          description: "Request took too long. Please try again.",
          variant: "destructive",
        });
      }, 10000);
      
      // Add to refs for cleanup
      timeoutRefs.current.push(timeoutId);
      
      const res = await apiRequest("POST", "/api/customer/login", credentials);
      
      // Clear timeout since request completed
      window.clearTimeout(timeoutId);
      timeoutRefs.current = timeoutRefs.current.filter(id => id !== timeoutId);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }
      
      const userData = await res.json();
      queryClient.setQueryData(["/api/customer/me"], userData);
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.name}!`,
      });
      
      return userData;
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Incorrect email or password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<CustomerUser> => {
    try {
      const res = await apiRequest("POST", "/api/customer/register", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Registration failed");
      }
      
      const userData = await res.json();
      queryClient.setQueryData(["/api/customer/me"], userData);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
      
      return userData;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const res = await apiRequest("POST", "/api/customer/logout");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Logout failed");
      }
      
      queryClient.setQueryData(["/api/customer/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/customer"] });
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "An error occurred during logout",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error: error || null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

// Hook - Using const declaration for better HMR compatibility
export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}