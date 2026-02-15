
import React from 'react';
import { AppState } from '../types';
import { Icons } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeState: AppState;
  onNavigate: (state: AppState) => void;
  userName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeState, onNavigate, userName }) => {
  const navItems = [
    { id: AppState.DASHBOARD, label: 'Home', icon: <Icons.Home /> },
    { id: AppState.COMPANION, label: 'Companion', icon: <Icons.Message /> },
    { id: AppState.ROUTINE, label: 'Routine', icon: <Icons.Clock /> },
    { id: AppState.REMINISCENCE, label: 'Memories', icon: <Icons.Heart /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center z-10 senior-card">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-xl">G</div>
          <h1 className="text-2xl font-bold text-slate-800 hidden sm:block">GoldenYears</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 font-medium">Hello, {userName || 'Friend'}!</span>
          <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <div className="w-8 h-8 rounded-full bg-amber-200" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 sm:pb-4 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile & Desktop (Senior Friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-20 sm:relative sm:border-t-0 sm:bg-transparent sm:mt-auto sm:mb-4 sm:max-w-md sm:mx-auto sm:rounded-2xl sm:shadow-lg sm:bg-white/80 sm:backdrop-blur-md">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all ${
              activeState === item.id 
                ? 'text-sky-600 bg-sky-50 font-bold scale-105' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {item.icon}
            <span className="text-sm mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
