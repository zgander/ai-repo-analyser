import { Github, Folder, Check, X } from 'lucide-react';

import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  selectedRepo: string;
  setSelectedRepo: (repo: string) => void;
}

const repos = ["Repo Alpha", "Repo Beta", "Repo Gamma", "Repo Delta", "Repo Epsilon", "Repo Zeta", "Repo Eta", "Repo Theta"];

const Sidebar = ({ isOpen, setIsOpen, selectedRepo, setSelectedRepo }: SidebarProps) => {

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
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* Toggle Button for Mobile */}
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-muted hover:text-primary transition-colors p-2"
        >
          <X size={20} />
        </button>

        {/* Sidebar Header */}
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-primary font-semibold text-xl hover:text-accent transition-colors cursor-pointer">
              <Github size={28} />
              <span className="tracking-tight">zgander</span>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="w-full h-[1px] bg-border mb-6 shadow-sm"></div>

          <h2 className="text-xs uppercase tracking-wider text-muted font-semibold mb-3 px-1">
            Repositories
          </h2>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {repos.map((repo) => (
              <button
                key={repo}
                onClick={() => {
                  setSelectedRepo(repo);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all ${
                  selectedRepo === repo 
                    ? 'bg-accent/10 border border-accent/30 text-accent font-medium shadow-sm' 
                    : 'border border-transparent text-muted hover:bg-elevated hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Folder size={16} className={selectedRepo === repo ? 'text-accent' : 'opacity-70'} />
                  <span className="truncate">{repo}</span>
                </div>
                {selectedRepo === repo && <Check size={16} className="text-accent" />}
              </button>
            ))}
          </div>
        </div>

        {/* Filler to push footer down */}
        <div className="flex-grow"></div>
      </aside>
    </>
  );
};

export default Sidebar;
