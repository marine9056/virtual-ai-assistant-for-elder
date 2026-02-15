
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { MoodData, MemoryEntry } from '../types';

interface DashboardProps {
  moodHistory: MoodData[];
  memories: MemoryEntry[];
  onStartCompanion: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ moodHistory, memories, onStartCompanion }) => {
  const latestMood = moodHistory[moodHistory.length - 1]?.score || 0;
  
  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl p-8 text-white senior-card relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">How are you today?</h2>
          <p className="text-sky-100 text-lg mb-6">Goldie is waiting to hear from you and revisit some of your favorite memories.</p>
          <button 
            onClick={onStartCompanion}
            className="bg-white text-sky-600 px-8 py-3 rounded-full font-bold text-xl hover:bg-sky-50 transition-colors shadow-lg"
          >
            Talk with Goldie
          </button>
        </div>
        <div className="absolute right-[-20px] top-[-20px] opacity-10 transform rotate-12">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Trend */}
        <div className="bg-white p-6 rounded-3xl senior-card">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Your Happiness Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodHistory}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis hide domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Summary */}
        <div className="bg-white p-6 rounded-3xl senior-card">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Memory Recall Activity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodHistory.slice(-7)}>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="engagement" radius={[10, 10, 0, 0]}>
                  {moodHistory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.engagement > 7 ? '#10b981' : '#fbbf24'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Memories Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-slate-800">Your Memory Lane</h3>
          <button className="text-sky-600 font-semibold hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {memories.length > 0 ? (
            memories.slice(0, 3).map((memory) => (
              <div key={memory.id} className="group cursor-pointer">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-2 senior-card">
                  <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
                <p className="font-bold text-slate-800 truncate">{memory.title}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500">No memories shared yet. Talk to Goldie to start!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
