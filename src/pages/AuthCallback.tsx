import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github, Loader2, AlertCircle } from 'lucide-react';

/**
 * GitHub redirects here after the user authorizes the app.
 * URL will contain ?code=XXXX (and optionally ?error=...)
 *
 * This page:
 *  1. Reads the code from the URL
 *  2. Calls AuthContext.login() which POSTs to the backend
 *  3. On success → redirects to /dashboard
 *  4. On failure → shows an error with a retry link
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const hasRan = useRef(false); // Prevent double-invocation in StrictMode

  useEffect(() => {
    // If we're already authenticated (e.g. back-button), just go to dashboard
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (hasRan.current) return;
    hasRan.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const ghError = params.get('error');

    if (ghError || !code) {
      // GitHub returned an error (user denied, etc.)
      return;
    }

    // Clean the code from the URL immediately so it can't be reused
    window.history.replaceState({}, document.title, '/auth/callback');

    login(code).then(() => {
      navigate('/dashboard', { replace: true });
    });
  }, [isAuthenticated, login, navigate]);

  const ghError = new URLSearchParams(window.location.search).get('error');
  const ghErrorDesc = new URLSearchParams(window.location.search).get(
    'error_description'
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-4">
        <Github className="text-primary" size={36} />
        <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-accent">
          RepoAnalyzer
        </span>
      </div>

      {/* States */}
      {(isLoading || (!error && !ghError)) && (
        <div className="flex flex-col items-center gap-4 text-muted">
          <Loader2 size={40} className="animate-spin text-accent" />
          <p className="text-base font-medium">Authenticating with GitHub…</p>
          <p className="text-sm opacity-70">Hang tight, this only takes a moment.</p>
        </div>
      )}

      {(error || ghError) && (
        <div className="bg-surface border border-red-500/30 rounded-2xl p-8 max-w-md w-full flex flex-col items-center gap-4 shadow-xl">
          <AlertCircle size={36} className="text-red-400" />
          <h2 className="text-xl font-semibold text-primary">Authentication Failed</h2>
          <p className="text-sm text-muted text-center">
            {ghErrorDesc ?? error ?? 'An unexpected error occurred.'}
          </p>
          <a
            href="/"
            className="mt-2 px-6 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accentHover transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      )}
    </div>
  );
}
