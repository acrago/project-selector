import * as React from 'react';
import { GitLabUser } from '../types';
import { generatePKCE, storeReturnUrl, storeVerifier } from '../services/pkce';

const TOKEN_KEY = 'gitlab_oauth_token';
const USER_KEY = 'gitlab_oauth_user';

/** Token used for local dev fake sign-in; only valid when hostname is localhost. */
export const DEV_FAKE_TOKEN = 'dev-fake-token';

function isLocalhost(): boolean {
  return typeof window !== 'undefined' && window.location.hostname === 'localhost';
}

interface GitLabAuthContextType {
  user: GitLabUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  /** Available only on localhost; sets fake user/token so you can test without GitLab. */
  devFakeLogin?: () => void;
  /** True when current token is the dev-fake token. */
  isDevFakeAuth: boolean;
}

const GitLabAuthContext = React.createContext<GitLabAuthContextType | undefined>(undefined);

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getStoredUser(): GitLabUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GitLabUser;
  } catch {
    return null;
  }
}

export function storeGitLabAuth(token: string, user: GitLabUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearGitLabAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isDevFakeAuth(): boolean {
  return getStoredToken() === DEV_FAKE_TOKEN;
}

export { getStoredToken };

function getGitLabBaseUrl(): string {
  const url = process.env.VITE_GITLAB_BASE_URL || 'https://gitlab.cee.redhat.com';
  return url.replace(/\/+$/, '');
}

function getClientId(): string | undefined {
  return process.env.VITE_GITLAB_CLIENT_ID;
}

function getRedirectUri(): string {
  return `${window.location.origin}${process.env.PUBLIC_PATH || ''}/auth/gitlab/callback`;
}

export const GitLabAuthProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<GitLabUser | null>(() => getStoredUser());
  const [token, setToken] = React.useState<string | null>(() => getStoredToken());

  const isAuthenticated = !!(user && token);
  const isDevFakeAuth = token === DEV_FAKE_TOKEN;

  const devFakeLogin = React.useCallback(() => {
    if (!isLocalhost()) return;
    storeGitLabAuth(DEV_FAKE_TOKEN, { login: 'Dev User', avatar: '' });
    setToken(DEV_FAKE_TOKEN);
    setUser({ login: 'Dev User', avatar: '' });
  }, []);

  const login = React.useCallback(async () => {
    const clientId = getClientId();
    if (!clientId) {
      console.warn('GitLab OAuth not configured: missing VITE_GITLAB_CLIENT_ID');
      return;
    }

    const { verifier, challenge } = await generatePKCE();
    storeVerifier(verifier);
    storeReturnUrl(window.location.pathname + window.location.search);

    const baseUrl = getGitLabBaseUrl();
    const redirectUri = getRedirectUri();

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'api',
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `${baseUrl}/oauth/authorize?${params.toString()}`;
  }, []);

  const logout = React.useCallback(() => {
    clearGitLabAuth();
    setUser(null);
    setToken(null);
  }, []);

  // Listen for storage events so multiple tabs stay in sync
  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        setToken(e.newValue);
      }
      if (e.key === USER_KEY) {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = React.useMemo<GitLabAuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated,
      login,
      logout,
      devFakeLogin: isLocalhost() ? devFakeLogin : undefined,
      isDevFakeAuth,
    }),
    [user, token, isAuthenticated, login, logout, devFakeLogin, isDevFakeAuth],
  );

  return <GitLabAuthContext.Provider value={value}>{children}</GitLabAuthContext.Provider>;
};

export const useGitLabAuth = (): GitLabAuthContextType => {
  const ctx = React.useContext(GitLabAuthContext);
  if (!ctx) throw new Error('useGitLabAuth must be used within a GitLabAuthProvider');
  return ctx;
};
