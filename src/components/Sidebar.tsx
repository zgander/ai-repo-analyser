import { useState } from 'react';
import {
  Github,
  Folder,
  Check,
  X,
  Loader2,
  AlertCircle,
  LogOut,
  Lock,
  Unlock,
  Star,
  GitFork,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth, type GitHubRepo } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  selectedRepo: string;
  setSelectedRepo: (repo: string) => void;
}

// ─── Skeleton loader for repo list ────────────────────────────────────────────
function RepoSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-1.5 px-4 py-3 rounded-lg border border-border/50 animate-pulse"
        >
          <div className="h-3.5 bg-elevated rounded-full w-3/4" />
          <div className="h-2.5 bg-elevated rounded-full w-1/2 opacity-60" />
        </div>
      ))}
    </div>
  );
}

// ─── Single repo row ──────────────────────────────────────────────────────────
function RepoRow({
  repo,
  isSelected,
  onClick,
}: {
  repo: GitHubRepo;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isPrivate = repo.visibility === 'private';

  return (
    <button
      key={repo.id}
      onClick={onClick}
      title={repo.description ?? repo.name}
      className={`w-full flex flex-col gap-1 px-4 py-3 rounded-lg text-sm transition-all text-left ${
        isSelected
          ? 'bg-accent/10 border border-accent/30 text-accent font-medium shadow-sm'
          : 'border border-transparent text-muted hover:bg-elevated hover:text-primary'
      }`}
    >
      {/* Top row: icon + name + check */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Folder
            size={14}
            className={`shrink-0 ${isSelected ? 'text-accent' : 'opacity-60'}`}
          />
          <span className="truncate font-medium">{repo.name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isPrivate ? (
            <Lock size={11} className="opacity-50" />
          ) : (
            <Unlock size={11} className="opacity-40" />
          )}
          {isSelected && <Check size={14} className="text-accent" />}
        </div>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-xs text-muted/70 truncate leading-tight pl-[22px]">
          {repo.description}
        </p>
      )}

      {/* Meta row: language · stars · forks */}
      <div className="flex items-center gap-3 pl-[22px] mt-0.5 text-[10px] text-muted/60">
        {repo.language && <span>{repo.language}</span>}
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-0.5">
            <Star size={9} /> {repo.stargazers_count}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span className="flex items-center gap-0.5">
            <GitFork size={9} /> {repo.forks_count}
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, setIsOpen, selectedRepo, setSelectedRepo }: SidebarProps) => {
  const { user, repos, isLoading, error, isAuthenticated, logout } = useAuth();
  const [search, setSearch] = useState('');

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRepoClick = (repoFullName: string) => {
    setSelectedRepo(repoFullName);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-muted hover:text-primary transition-colors p-2"
        >
          <X size={20} />
        </button>

        <div className="p-6 flex flex-col h-full overflow-hidden">
          {/* Header: avatar / username */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-8 h-8 rounded-full border border-border object-cover"
                />
              ) : (
                <Github size={28} className="text-primary shrink-0" />
              )}
              <span className="text-primary font-semibold text-lg tracking-tight truncate hover:text-accent transition-colors cursor-default">
                {user?.login ?? 'RepoAnalyzer'}
              </span>
            </div>
            <ThemeToggle />
          </div>

          <div className="w-full h-px bg-border mb-5 shrink-0" />

          {/* ── Authenticated state ── */}
          {isAuthenticated && (
            <>
              {/* Search box */}
              <div className="mb-4 shrink-0">
                <input
                  type="text"
                  placeholder="Search repositories…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                />
              </div>

              <h2 className="text-xs uppercase tracking-wider text-muted font-semibold mb-3 px-1 shrink-0">
                Repositories
                {repos.length > 0 && (
                  <span className="ml-2 text-accent/70">{repos.length}</span>
                )}
              </h2>

              {/* Repo list */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar min-h-0">
                {isLoading ? (
                  <RepoSkeleton />
                ) : error ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center px-2">
                    <AlertCircle size={24} className="text-red-400" />
                    <p className="text-xs text-muted">{error}</p>
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <p className="text-xs text-muted text-center py-8">
                    {search ? 'No repos match your search.' : 'No repositories found.'}
                  </p>
                ) : (
                  filteredRepos.map((repo) => (
                    <RepoRow
                      key={repo.id}
                      repo={repo}
                      isSelected={selectedRepo === repo.full_name}
                      onClick={() => handleRepoClick(repo.full_name)}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {/* ── Unauthenticated placeholder ── */}
          {!isAuthenticated && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-2">
              <Github size={32} className="text-muted/50" />
              <p className="text-sm text-muted">
                Connect your GitHub account to see your repositories here.
              </p>
              <a
                href="/"
                className="mt-2 px-5 py-2 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accentHover transition-colors"
              >
                Connect GitHub
              </a>
            </div>
          )}

          {/* ── Loading indicator (re-hydration) ── */}
          {!isAuthenticated && isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-accent" />
              <p className="text-xs text-muted">Loading session…</p>
            </div>
          )}

          {/* Logout button pinned at the bottom */}
          {isAuthenticated && (
            <div className="shrink-0 mt-4 pt-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <LogOut size={15} />
                <span>Disconnect GitHub</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
