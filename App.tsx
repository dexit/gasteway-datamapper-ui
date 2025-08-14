import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { IngestRequests } from './components/IngestRequests';
import { DispatchLogs } from './components/DispatchLogs';
import { ConfigManager } from './components/ConfigManager';
import { Page, ConfigType } from './types';
import { MenuIcon, CloseIcon } from './components/icons';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleResize = () => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'ingest-requests':
        return <IngestRequests />;
      case 'dispatch-logs':
        return <DispatchLogs />;
      case 'dto':
        return <ConfigManager type={ConfigType.DTO} />;
      case 'etl':
        return <ConfigManager type={ConfigType.ETL} />;
      case 'dispatch-rules':
        return <ConfigManager type={ConfigType.Dispatch} />;
      case 'webhooks':
        return <ConfigManager type={ConfigType.Webhook} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <div
        className={`fixed top-0 left-0 z-30 h-full w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={(page) => {
            setCurrentPage(page);
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }} 
        />
      </div>

      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 md:hidden bg-slate-900 border-b border-slate-800">
            <h1 className="text-xl font-bold text-white">Gateway UI</h1>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-300 hover:text-white">
                {isSidebarOpen ? <CloseIcon className="w-6 h-6"/> : <MenuIcon className="w-6 h-6"/>}
            </button>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;