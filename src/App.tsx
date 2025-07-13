import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { VideoConference } from './components/VideoConference';
import { ChatPanel } from './components/ChatPanel';
import { SchedulingPanel } from './components/SchedulingPanel';
import { Header } from './components/Header';
import { AppProvider } from './context/AppContext';

export type ActiveView = 'video' | 'chat' | 'schedule';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('video');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'video':
        return <VideoConference />;
      case 'chat':
        return <ChatPanel />;
      case 'schedule':
        return <SchedulingPanel />;
      default:
        return <VideoConference />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex h-screen pt-16">
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
          <main className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}>
            <div className="h-full p-6">
              {renderActiveView()}
            </div>
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
