import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types
type User = {
  id: number;
  username: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<boolean>;
};

// Context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load token from localStorage on init
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user data
      fetchUserData(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch user data with token
  const fetchUserData = async (authToken: string) => {
    try {
      setIsLoading(true);
      
      // Skip token validation on non-admin routes
      const pathname = window.location.pathname;
      if (!pathname.startsWith('/admin')) {
        console.log("Skipping admin auth validation for non-admin route:", pathname);
        setIsLoading(false);
        return;
      }
      
      console.log("Validating admin auth token");
      const response = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        // Add cache control to prevent excessive requests
        cache: 'no-cache',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token invalid, remove it
        localStorage.removeItem("auth_token");
        setToken(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // On error, keep the existing token but don't validate further
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/login", { username, password });
      const data = await response.json();

      // Save token and user data
      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  // Register function
  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/register", { username, password });
      const data = await response.json();

      // Save token and user data
      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.user.username}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Username may already be taken",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useSimpleAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider");
  }
  return context;
}