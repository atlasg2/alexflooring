import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { addAuthHeaders, getAuthToken, isTokenAuthEnabled } from "./tokenAuth";
import { throttle } from '@/utils/performance';

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<Response>>();
const serverErrorCache = new Map<string, {timestamp: number, error: Error}>();
const SERVER_ERROR_CACHE_TTL = 10000; // 10 seconds TTL for server errors

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Debounced cache cleanup function
const cleanupRequestCache = throttle(() => {
  const now = Date.now();
  
  // Cleanup ongoing requests - using Array.from to avoid iterator issues
  Array.from(ongoingRequests.keys()).forEach(key => {
    const promise = ongoingRequests.get(key);
    if (promise) {
      promise.then(
        () => ongoingRequests.delete(key),
        () => ongoingRequests.delete(key)
      );
    }
  });
  
  // Cleanup expired server errors - using Array.from to avoid iterator issues 
  Array.from(serverErrorCache.keys()).forEach(key => {
    const entry = serverErrorCache.get(key);
    if (entry && now - entry.timestamp > SERVER_ERROR_CACHE_TTL) {
      serverErrorCache.delete(key);
    }
  });
}, 5000); // Run cleanup every 5 seconds at most

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const requestKey = method === "GET" ? url : `${method}:${url}:${JSON.stringify(data || {})}`;
  
  // Reuse in-flight GET requests
  if (method === "GET" && ongoingRequests.has(requestKey)) {
    return ongoingRequests.get(requestKey)!.then(res => res.clone());
  }
  
  // Check for cached server errors
  const cachedError = serverErrorCache.get(requestKey);
  if (cachedError && Date.now() - cachedError.timestamp < SERVER_ERROR_CACHE_TTL) {
    console.warn(`Using cached error for ${requestKey}`);
    return Promise.reject(cachedError.error);
  }
  
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
    }
  }
  
  // Create request and store it for deduplication
  const requestPromise = fetch(url, options).then(async response => {
    // Remove from ongoing requests when completed
    ongoingRequests.delete(requestKey);
    
    // For server errors, cache them briefly to prevent hammering the server
    if (response.status >= 500) {
      try {
        const text = await response.clone().text();
        const error = new Error(`${response.status}: ${text || response.statusText}`);
        serverErrorCache.set(requestKey, { 
          timestamp: Date.now(), 
          error 
        });
      } catch (e) {
        console.error('Error caching server error:', e);
      }
    }
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status}: ${text || response.statusText}`);
    }
    
    return response;
  }).catch(error => {
    // Remove from ongoing requests on error
    ongoingRequests.delete(requestKey);
    
    // Cache server errors for a short time
    if (error.message.startsWith('5')) {
      serverErrorCache.set(requestKey, { 
        timestamp: Date.now(), 
        error 
      });
    }
    
    throw error;
  });
  
  // Store GET requests for deduplication
  if (method === "GET") {
    ongoingRequests.set(requestKey, requestPromise);
    // Schedule cache cleanup
    cleanupRequestCache();
  }
  
  return requestPromise;
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
