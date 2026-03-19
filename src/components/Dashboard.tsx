import { useState } from 'react';
import Sidebar from './Sidebar';
import Report from './Report';

const Dashboard = () => {
  const [selectedRepo, setSelectedRepo] = useState('Repo Alpha');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        key={selectedRepo} 
        selectedRepo={selectedRepo} 
        setSidebarOpen={setSidebarOpen} 
      />
    </div>
  );
};

export default Dashboard;
