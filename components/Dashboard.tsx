
import React from 'react';
import { MoodData, MemoryEntry } from '../types';

interface DashboardProps {
  moodHistory: MoodData[];
  memories: MemoryEntry[];
  onStartCompanion: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ moodHistory, memories, onStartCompanion }) => {
  const latestMood = moodHistory[moodHistory.length - 1];
  
  // Status Logic
  const getMoodStatus = (score: number) => {
    if (score >= 8) return { icon: '☀️', label: 'Sunny', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', desc: "You're feeling wonderful today!" };
    if (score >= 5) return { icon: '🌤️', label: 'Fair', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', desc: "You're doing quite well." };
    return { icon: '☁️', label: 'Cloudy', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', desc: "A bit of a quiet day." };
  };

  const status = getMoodStatus(latestMood?.score || 8);

  return (
    <div className="space-y-12">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-[50px] p-12 text-white senior-card relative overflow-hidden shadow-2xl border-4 border-white/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left flex-1">
            <h2 className="text-6xl font-black mb-4 leading-tight">Hello there!</h2>
            <p className="text-sky-100 text-3xl mb-10 font-medium italic">"Shall we have a nice chat today?"</p>
            <button 
              onClick={onStartCompanion}
              className="bg-white text-sky-700 px-16 py-6 rounded-[35px] font-black text-4xl hover:bg-sky-50 transition-all shadow-xl active:scale-95"
            >
              Start Chatting
            </button>
          </div>
          <div className="w-56 h-56 bg-white/20 rounded-full flex items-center justify-center animate-float backdrop-blur-md border-4 border-white/30">
            <span className="text-9xl">😊</span>
          </div>
        </div>
      </div>

      {/* Simplified Status Cards */}
      <section>
        <h3 className="text-4xl font-black text-slate-800 mb-8 px-4">Your Daily Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Mood Card */}
          <div className={`${status.bg} ${status.border} border-4 p-8 rounded-[45px] text-center shadow-lg transition-transform hover:scale-105`}>
            <span className="text-8xl block mb-4">{status.icon}</span>
            <p className="text-xl font-black text-slate-500 uppercase tracking-widest">Your Mood</p>
            <h4 className={`text-5xl font-black ${status.color} mt-2`}>{status.label}</h4>
            <p className="text-slate-600 text-xl font-bold mt-4">{status.desc}</p>
          </div>

          {/* Energy Card */}
          <div className="bg-emerald-50 border-emerald-100 border-4 p-8 rounded-[45px] text-center shadow-lg transition-transform hover:scale-105">
            <span className="text-8xl block mb-4">🔋</span>
            <p className="text-xl font-black text-slate-500 uppercase tracking-widest">Your Energy</p>
            <h4 className="text-5xl font-black text-emerald-600 mt-2">Strong</h4>
            <p className="text-slate-600 text-xl font-bold mt-4">You have plenty of vitality!</p>
          </div>

          {/* Memory Strength Card */}
          <div className="bg-indigo-50 border-indigo-100 border-4 p-8 rounded-[45px] text-center shadow-lg transition-transform hover:scale-105">
            <span className="text-8xl block mb-4">🧠</span>
            <p className="text-xl font-black text-slate-500 uppercase tracking-widest">Memory</p>
            <h4 className="text-5xl font-black text-indigo-600 mt-2">Bright</h4>
            <p className="text-slate-600 text-xl font-bold mt-4">Your stories are coming to life!</p>
          </div>
        </div>
      </section>

      {/* Recent Memories Summary */}
      <section>
        <div className="flex justify-between items-end mb-8 px-4">
          <h3 className="text-4xl font-black text-slate-800">Your Storybook</h3>
          <button className="text-sky-600 font-black text-2xl hover:underline">View All Memories ➔</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {memories.length > 0 ? (
            memories.slice(0, 3).map((memory) => (
              <div key={memory.id} className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-[45px] overflow-hidden mb-4 senior-card border-4 border-white shadow-xl">
                  <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                <p className="font-black text-slate-800 text-2xl px-4">{memory.title}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-white rounded-[50px] border-4 border-dashed border-slate-200 shadow-inner">
              <span className="text-7xl block mb-6">📷</span>
              <p className="text-slate-400 text-3xl font-black">Talk to Goldie to start your storybook!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
