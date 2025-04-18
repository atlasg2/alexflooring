import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types
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

// Context
const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

// Provider
export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<CustomerUser | null, Error>({
    queryKey: ["/api/customer/me"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/customer/me");
        if (res.ok) {
          return res.json();
        }
        return null;
      } catch (error) {
        console.error("Error fetching customer:", error);
        return null;
      }
    },
  });

  const login = async (credentials: LoginCredentials): Promise<CustomerUser> => {
    try {
      const res = await apiRequest("POST", "/api/customer/login", credentials);
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

// Hook
export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}