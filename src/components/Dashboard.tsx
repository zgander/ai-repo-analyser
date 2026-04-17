import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Report from './Report';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { repos, isAuthenticated } = useAuth();
  const [selectedRepo, setSelectedRepo] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-select the first real repo once they load
  useEffect(() => {
    if (repos.length > 0 && !selectedRepo) {
      setSelectedRepo(repos[0].full_name);
    }
  }, [repos, selectedRepo]);

  // Fallback label when not authenticated
  const displayRepo = selectedRepo || (isAuthenticated ? 'Loading…' : 'Demo Repo');

  return (
    <div className="flex min-h-screen w-full bg-background text-primary selection:bg-accent selection:text-white font-sans transition-colors duration-300">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        selectedRepo={selectedRepo}
        setSelectedRepo={setSelectedRepo}
      />

      {/* Pass a unique key to Report so the typing animation restarts when repo changes */}
      <Report
        key={displayRepo}
        selectedRepo={displayRepo}
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  );
};

export default Dashboard;
