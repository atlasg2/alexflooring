// Token-based authentication utilities

// Default tokens (these should be changed in production via environment variables)
const DEVELOPER_TOKEN = 'dev-secret-token-for-emergency';
const OWNER_TOKEN = 'owner-secret-token-for-emergency';

// Storage keys
const TOKEN_STORAGE_KEY = 'aps_auth_token';
const USER_ROLE_KEY = 'aps_user_role';
const AUTH_METHOD_KEY = 'aps_auth_method';

/**
 * Roles available for token authentication
 */
export type TokenRole = 'developer' | 'owner';

/**
 * Store token authentication information in localStorage
 */
export function enableTokenAuth(role: TokenRole) {
  const token = role === 'developer' ? DEVELOPER_TOKEN : OWNER_TOKEN;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_ROLE_KEY, role);
  localStorage.setItem(AUTH_METHOD_KEY, 'token');
  
  console.log(`Token authentication enabled for ${role} role`);
  return true;
}

/**
 * Disable token authentication
 */
export function disableTokenAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(AUTH_METHOD_KEY);
  
  console.log('Token authentication disabled');
  return true;
}

/**
 * Check if token authentication is enabled
 */
export function isTokenAuthEnabled(): boolean {
  return localStorage.getItem(AUTH_METHOD_KEY) === 'token';
}

/**
 * Get the current authentication token if enabled
 */
export function getAuthToken(): string | null {
  if (isTokenAuthEnabled()) {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return null;
}

/**
 * Get the current user role if token auth is enabled
 */
export function getUserRole(): TokenRole | null {
  if (isTokenAuthEnabled()) {
    return localStorage.getItem(USER_ROLE_KEY) as TokenRole;
  }
  return null;
}

/**
 * Add authorization header to fetch options if token auth is enabled
 */
export function addAuthHeaders(options: RequestInit = {}): RequestInit {
  const token = getAuthToken();
  
  if (!token) {
    return options;
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  return {
    ...options,
    headers
  };
}