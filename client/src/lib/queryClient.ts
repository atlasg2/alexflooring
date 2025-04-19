import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { addAuthHeaders, getAuthToken, isTokenAuthEnabled } from "./tokenAuth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Start with the basic options
  const options: RequestInit = {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  };
  
  // Add authorization header if token auth is enabled
  if (isTokenAuthEnabled()) {
    const token = getAuthToken();
    if (token) {
      // Create a new headers object by merging the existing headers
      const headers = new Headers(options.headers as HeadersInit);
      headers.set('Authorization', `Bearer ${token}`);
      options.headers = Object.fromEntries(headers.entries());
      console.log('Using token authentication for API request');
    }
  }
  
  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Start with basic options
    const fetchOptions: RequestInit = {
      credentials: "include",
    };
    
    // Add authorization headers if token auth is enabled
    if (isTokenAuthEnabled()) {
      const token = getAuthToken();
      if (token) {
        fetchOptions.headers = {
          'Authorization': `Bearer ${token}`
        };
        console.log('Using token authentication for query');
      }
    }

    const res = await fetch(queryKey[0] as string, fetchOptions);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false, // Prevent refetching on window focus which can cause lag
      staleTime: 300000, // Keep data fresh for 5 minutes to reduce refetches (increased from 1 minute)
      retry: 1,
      gcTime: 600000 // Keep unused data in cache for 10 minutes before garbage collection
    },
    mutations: {
      retry: 1,
    },
  },
});
