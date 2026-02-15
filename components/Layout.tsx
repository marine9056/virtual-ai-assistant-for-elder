
import React from 'react';
import { AppState, Settings } from '../types';
import { Icons } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeState: AppState;
  onNavigate: (state: AppState) => void;
  userName?: string;
  settings: Settings;
}

const Layout: React.FC<LayoutProps> = ({ children, activeState, onNavigate, userName, settings }) => {
  const navItems = [
    { id: AppState.DASHBOARD, label: 'Home', icon: <Icons.Home /> },
    { id: AppState.COMPANION, label: 'Goldie', icon: <Icons.Message /> },
    { id: AppState.ROUTINE, label: 'Routine', icon: <Icons.Clock /> },
    { id: AppState.HISTORY, label: 'History', icon: <Icons.History /> },
  ];

  const highContrastStyle = settings.contrast === 'high' ? 'bg-black text-yellow-400' : 'bg-slate-50 text-slate-900';

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${highContrastStyle}`}>
      {/* Top Header */}
      <header className={`border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-20 senior-card ${settings.contrast === 'high' ? 'bg-black border-yellow-400' : 'bg-white'}`}>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-600 rounded-full flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg">G</div>
          <h1 className="text-xl sm:text-3xl font-black truncate max-w-[120px] sm:max-w-none">GoldenYears</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => onNavigate(AppState.EMERGENCY)}
            className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl hover:bg-red-700 shadow-lg animate-pulse"
          >
            HELP
          </button>
          <button 
            onClick={() => onNavigate(AppState.SETTINGS)}
            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all border-2 ${settings.contrast === 'high' ? 'border-yellow-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
          >
            <Icons.Settings />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-28 sm:pb-32 p-4 sm:p-10">
        <div className="max-w-5xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t flex justify-around items-center p-2 sm:p-3 z-30 ${settings.contrast === 'high' ? 'bg-black border-yellow-400' : 'bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]'}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-2 px-3 sm:px-6 rounded-2xl sm:rounded-3xl transition-all min-w-[64px] sm:min-w-[80px] ${
              activeState === item.id 
                ? (settings.contrast === 'high' ? 'bg-yellow-400 text-black font-black' : 'text-sky-600 bg-sky-50 font-black scale-105 shadow-sm') 
                : (settings.contrast === 'high' ? 'text-yellow-200' : 'text-slate-400 hover:text-slate-600')
            }`}
          >
            <div className="scale-110 sm:scale-125">{item.icon}</div>
            <span className="text-xs sm:text-base mt-1 font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
