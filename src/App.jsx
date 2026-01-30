import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import useVoiceCommands from './hooks/useVoiceCommands';

const App = () => {
  const { isListening, toggleListening } = useVoiceCommands();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-72'}`}>
        <Sidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          isMobileMenuOpen={isMobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <div className="flex flex-col min-h-screen">
          <Topbar 
            isCollapsed={isCollapsed} 
            setMobileMenuOpen={setMobileMenuOpen} 
          />
          <main className="flex-1 p-4 w-full mt-16">
            <Outlet />
          </main>
          
        </div>
      </div>
    </div>
  );
};

export default App;
