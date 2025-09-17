import React, { useState } from 'react';
import { Page, ConfigType } from '../types';
import { DashboardIcon, IngestIcon, ProcessIcon, DispatchIcon, ChevronDownIcon, RequestsIcon, DispatchLogsIcon, WebhookIcon } from './icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

interface NavSection {
  title: string;
  icon: React.ReactNode;
  // FIX: Changed icon type to be a ReactElement that accepts a className prop to fix an issue with React.cloneElement.
  pages: { page: Page; label: string, icon: React.ReactElement<{ className?: string }> }[];
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isSubItem?: boolean;
}> = ({ icon, label, isActive, onClick, isSubItem = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center text-sm font-medium rounded-lg transition-colors duration-200 ${isSubItem ? 'px-2 py-2' : 'px-4 py-3'} ${
      isActive
        ? 'bg-cyan-500 text-white'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const CollapsibleNav: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    pages: Page[];
    currentPage: Page;
}> = ({ title, icon, children, pages, currentPage }) => {
    const isActive = pages.includes(currentPage);
    const [isOpen, setIsOpen] = useState(isActive);

    return (
        <div>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive && !isOpen ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
                <div className="flex items-center">
                    {icon}
                    <span className="ml-3">{title}</span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="mt-2 pl-8 space-y-1">
                    {children}
                </div>
            )}
        </div>
    );
};


export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {

  const navStructure: NavSection[] = [
    {
      title: 'Ingest',
      icon: <IngestIcon className="w-6 h-6" />,
      pages: [
        { page: 'ingest-requests', label: 'Ingest Requests', icon: <RequestsIcon className="w-5 h-5" /> },
        { page: 'webhooks', label: ConfigType.Webhook, icon: <WebhookIcon className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Processing',
      icon: <ProcessIcon className="w-6 h-6" />,
      pages: [
        { page: 'dto', label: ConfigType.DTO, icon: <div className="w-5 h-5" /> },
        { page: 'etl', label: ConfigType.ETL, icon: <div className="w-5 h-5" /> },
      ],
    },
    {
        title: 'Dispatch',
        icon: <DispatchIcon className="w-6 h-6" />,
        pages: [
            { page: 'dispatch-rules', label: ConfigType.Dispatch, icon: <div className="w-5 h-5" /> },
            { page: 'dispatch-logs', label: 'Dispatch Logs', icon: <DispatchLogsIcon className="w-5 h-5" /> },
        ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col p-4 h-full">
      <div className="flex items-center mb-8 flex-shrink-0">
        <div className="bg-cyan-500 p-2 rounded-lg">
          <svg className="w-6 h-6 text-white" xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.88,2.88L14.12,5.65L12,7.77L9.88,5.65L7.12,2.88L2.88,7.12L5.65,9.88L7.77,12L5.65,14.12L2.88,16.88L7.12,21.12L9.88,18.35L12,16.23L14.12,18.35L16.88,21.12L21.12,16.88L18.35,14.12L16.23,12L18.35,9.88L21.12,7.12L16.88,2.88Z" /></svg>
        </div>
        <h1 className="text-xl font-bold text-white ml-3 hidden md:block">Gateway UI</h1>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto">
        <NavLink
          icon={<DashboardIcon className="w-6 h-6" />}
          label="Dashboard"
          isActive={currentPage === 'dashboard'}
          onClick={() => setCurrentPage('dashboard')}
        />
        
        {navStructure.map(section => (
            <CollapsibleNav 
                key={section.title}
                title={section.title}
                icon={section.icon}
                pages={section.pages.map(p => p.page)}
                currentPage={currentPage}
            >
                {section.pages.map(({ page, label, icon }) => (
                     <a
                        key={page}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentPage(page);}}
                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                            currentPage === page ? 'text-cyan-400 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {React.isValidElement(icon) && React.cloneElement(icon, { className: `w-5 h-5 mr-3 ${currentPage === page ? 'text-cyan-400' : 'text-slate-500'}` })}
                        {label}
                    </a>
                ))}
            </CollapsibleNav>
        ))}

      </nav>
    </aside>
  );
};