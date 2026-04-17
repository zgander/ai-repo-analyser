import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  visibility: string;
  updated_at: string;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
}

interface AuthState {
  sessionId: string | null;
  user: GitHubUser | null;
  repos: GitHubRepo[];
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const SESSION_STORAGE_KEY = 'gh_session_id';
// In development the Vite proxy forwards /auth/* and /api/* to Express.
// Set VITE_BACKEND_URL only if you need to point at a remote server.
const BACKEND = import.meta.env.VITE_BACKEND_URL ?? '';

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    sessionId: sessionStorage.getItem(SESSION_STORAGE_KEY),
    user: null,
    repos: [],
    isLoading: false,
    error: null,
  });

  // Helper to make authenticated API calls
  const authFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return fetch(`${BACKEND}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sid ?? '',
          ...(options.headers ?? {}),
        },
      });
    },
    []
  );

  // Exchange code → sessionId, then fetch user + repos
  const login = useCallback(
    async (code: string) => {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        // 1. Exchange code for server-side session
        const tokenRes = await fetch(`${BACKEND}/api/auth/github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!tokenRes.ok) {
          const err = await tokenRes.json().catch(() => ({}));
          throw new Error(err.error ?? 'Authentication failed');
        }

        const { sessionId } = await tokenRes.json();
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);

        // 2. Fetch user info
        const userRes = await fetch(`${BACKEND}/api/user`, {
          headers: { 'x-session-id': sessionId },
        });
        const user: GitHubUser = userRes.ok ? await userRes.json() : null;

        // 3. Fetch repos
        const repoRes = await fetch(`${BACKEND}/api/repos`, {
          headers: { 'x-session-id': sessionId },
        });
        const repos: GitHubRepo[] = repoRes.ok ? await repoRes.json() : [];

        setState({ sessionId, user, repos, isLoading: false, error: null });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setState((s) => ({ ...s, isLoading: false, error: msg }));
      }
    },
    []
  );

  // Re-hydrate user + repos if a session already exists on mount
  useEffect(() => {
    const sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) return;

    (async () => {
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const [userRes, repoRes] = await Promise.all([
          fetch(`${BACKEND}/api/user`, { headers: { 'x-session-id': sid } }),
          fetch(`${BACKEND}/api/repos`, { headers: { 'x-session-id': sid } }),
        ]);

        if (!userRes.ok) {
          // Session expired or invalid
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          setState({ sessionId: null, user: null, repos: [], isLoading: false, error: null });
          return;
        }

        const [user, repos] = await Promise.all([
          userRes.json(),
          repoRes.ok ? repoRes.json() : [],
        ]);

        setState({ sessionId: sid, user, repos, isLoading: false, error: null });
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    const sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sid) {
      await authFetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setState({ sessionId: null, user: null, repos: [], isLoading: false, error: null });
  }, [authFetch]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, isAuthenticated: !!state.sessionId }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
