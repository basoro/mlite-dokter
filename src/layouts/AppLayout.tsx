import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { Topbar } from './Topbar';
import { Menu } from 'lucide-react';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Topbar
        onMenuClick={() => {
          if (window.innerWidth < 1024) {
            setMobileSidebarOpen(!mobileSidebarOpen);
          } else {
            setSidebarOpen(!sidebarOpen);
          }
        }}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            absolute lg:static inset-y-0 left-0 z-50 
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'w-64' : 'w-0 lg:w-16'}
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            bg-card border-r overflow-hidden flex-shrink-0
          `}
        >
          <AppSidebar 
            collapsed={!sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)} 
            onNavigate={() => setMobileSidebarOpen(false)}
          />
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
