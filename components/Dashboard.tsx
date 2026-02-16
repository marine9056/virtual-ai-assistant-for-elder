
import React from 'react';
import { MoodData, MemoryEntry } from '../types';

interface DashboardProps {
  moodHistory: MoodData[];
  memories: MemoryEntry[];
  onStartCompanion: () => void;
  onUpgrade: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ moodHistory, memories, onStartCompanion, onUpgrade }) => {
  const latestMood = moodHistory[moodHistory.length - 1];
  
  const getMoodStatus = (score: number) => {
    if (score >= 8) return { icon: '☀️', label: 'Sunny', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', desc: "Wonderful day!" };
    if (score >= 5) return { icon: '🌤️', label: 'Fair', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', desc: "Doing well." };
    return { icon: '☁️', label: 'Cloudy', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', desc: "Quiet day." };
  };

  const status = getMoodStatus(latestMood?.score || 8);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-[30px] sm:rounded-[50px] p-6 sm:p-12 text-white senior-card relative overflow-hidden shadow-2xl border-4 border-white/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-10">
          <div className="text-center md:text-left flex-1 w-full">
            <h2 className="text-3xl sm:text-6xl font-black mb-2 sm:mb-4 leading-tight">Hello there!</h2>
            <p className="text-sky-100 text-xl sm:text-3xl mb-6 sm:mb-10 font-medium italic">"Shall we have a nice chat?"</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStartCompanion}
                className="bg-white text-sky-700 px-8 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-[35px] font-black text-2xl sm:text-3xl hover:bg-sky-50 transition-all shadow-xl active:scale-95"
              >
                Start Chatting
              </button>
              <button 
                onClick={onUpgrade}
                className="bg-amber-400 text-amber-900 px-8 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-[35px] font-black text-2xl sm:text-3xl hover:bg-amber-300 transition-all shadow-xl active:scale-95 border-b-4 border-amber-600"
              >
                Go Premium ⭐
              </button>
            </div>
          </div>
          <div className="hidden sm:flex w-32 h-32 sm:w-56 sm:h-56 bg-white/20 rounded-full items-center justify-center animate-float backdrop-blur-md border-4 border-white/30">
            <span className="text-5xl sm:text-9xl">😊</span>
          </div>
        </div>
      </div>

      {/* Simplified Status Cards */}
      <section>
        <h3 className="text-2xl sm:text-4xl font-black text-slate-800 mb-6 sm:mb-8 px-2">Your Daily Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          
          {/* Mood Card */}
          <div className={`${status.bg} ${status.border} border-4 p-6 sm:p-8 rounded-[30px] sm:rounded-[45px] text-center shadow-lg`}>
            <span className="text-5xl sm:text-8xl block mb-2 sm:mb-4">{status.icon}</span>
            <p className="text-sm sm:text-xl font-black text-slate-500 uppercase tracking-widest">Your Mood</p>
            <h4 className={`text-3xl sm:text-5xl font-black ${status.color} mt-1`}>{status.label}</h4>
            <p className="text-slate-600 text-base sm:text-xl font-bold mt-2 sm:mt-4">{status.desc}</p>
          </div>

          {/* Energy Card */}
          <div className="bg-emerald-50 border-emerald-100 border-4 p-6 sm:p-8 rounded-[30px] sm:rounded-[45px] text-center shadow-lg">
            <span className="text-5xl sm:text-8xl block mb-2 sm:mb-4">🔋</span>
            <p className="text-sm sm:text-xl font-black text-slate-500 uppercase tracking-widest">Energy</p>
            <h4 className="text-3xl sm:text-5xl font-black text-emerald-600 mt-1">Strong</h4>
            <p className="text-slate-600 text-base sm:text-xl font-bold mt-2 sm:mt-4">You have vitality!</p>
          </div>

          {/* Memory Strength Card */}
          <div className="bg-indigo-50 border-indigo-100 border-4 p-6 sm:p-8 rounded-[30px] sm:rounded-[45px] text-center shadow-lg sm:col-span-2 lg:col-span-1">
            <span className="text-5xl sm:text-8xl block mb-2 sm:mb-4">🧠</span>
            <p className="text-sm sm:text-xl font-black text-slate-500 uppercase tracking-widest">Memory</p>
            <h4 className="text-3xl sm:text-5xl font-black text-indigo-600 mt-1">Bright</h4>
            <p className="text-slate-600 text-base sm:text-xl font-bold mt-2 sm:mt-4">Stories coming to life!</p>
          </div>
        </div>
      </section>

      {/* Recent Memories Summary */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 px-2 gap-2">
          <h3 className="text-2xl sm:text-4xl font-black text-slate-800">Your Storybook</h3>
          <button className="text-sky-600 font-black text-lg sm:text-2xl hover:underline">View All ➔</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {memories.length > 0 ? (
            memories.slice(0, 3).map((memory) => (
              <div key={memory.id} className="group">
                <div className="relative aspect-[16/9] sm:aspect-[4/3] rounded-[30px] sm:rounded-[45px] overflow-hidden mb-3 senior-card border-4 border-white shadow-xl">
                  <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <p className="font-black text-slate-800 text-xl sm:text-2xl px-2">{memory.title}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 sm:py-24 text-center bg-white rounded-[30px] sm:rounded-[50px] border-4 border-dashed border-slate-200">
              <span className="text-5xl sm:text-7xl block mb-4 sm:mb-6">📷</span>
              <p className="text-slate-400 text-xl sm:text-3xl font-black px-4">Talk to Goldie to start your stories!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
