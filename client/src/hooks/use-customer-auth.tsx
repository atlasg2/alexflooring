import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { apiRequest } from "@/lib/queryClient";

// Query client to be used for cache invalidation
const queryClient = new QueryClient();

// Define the types for our auth context
type CustomerUser = {
  id: number;
  email: string;
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

// Create a context for authentication
const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<CustomerUser | null>(null);
  
  // Fetch current user data
  const {
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/customer/me"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/customer/me");
        if (!res.ok) {
          if (res.status === 401) {
            return null; // Not authenticated is not an error
          }
          throw new Error("Failed to fetch customer data");
        }
        const data = await res.json();
        setUser(data);
        return data;
      } catch (error) {
        console.error("Error fetching customer:", error);
        return null;
      }
    },
  });
  
  // Login function
  const login = async (credentials: LoginCredentials): Promise<CustomerUser> => {
    try {
      const res = await apiRequest("POST", "/api/customer/login", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }
      
      const userData = await res.json();
      setUser(userData);
      
      // Invalidate user data query to refresh
      queryClient.invalidateQueries({ queryKey: ["/api/customer/me"] });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
      
      return userData;
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Register function
  const register = async (data: RegisterData): Promise<CustomerUser> => {
    try {
      const res = await apiRequest("POST", "/api/customer/register", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Registration failed");
      }
      
      const userData = await res.json();
      setUser(userData);
      
      // Invalidate user data query to refresh
      queryClient.invalidateQueries({ queryKey: ["/api/customer/me"] });
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.name}!`,
      });
      
      return userData;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const res = await apiRequest("POST", "/api/customer/logout");
      if (!res.ok) {
        throw new Error("Logout failed");
      }
      
      setUser(null);
      
      // Invalidate user data query to refresh
      queryClient.invalidateQueries({ queryKey: ["/api/customer/me"] });
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        isLoading,
        error: error as Error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}