
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Companion from './components/Companion';
import Routine from './components/Routine';
import { AppState, UserProfile, MoodData, MemoryEntry, RoutineTask } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>([
    { id: '1', time: '08:00 AM', title: 'Morning Medication', description: 'Take 1 blue pill with water.', completed: false, type: 'medication' },
    { id: '2', time: '08:30 AM', title: 'Nutritious Breakfast', description: 'Oatmeal with fresh berries.', completed: true, type: 'meal' },
    { id: '3', time: '10:00 AM', title: 'Morning Walk', description: '15 minutes in the garden.', completed: false, type: 'activity' },
    { id: '4', time: '01:00 PM', title: 'Lunch Time', description: 'Grilled chicken salad.', completed: false, type: 'meal' },
    { id: '5', time: '06:00 PM', title: 'Evening Medication', description: 'Take 2 white pills after dinner.', completed: false, type: 'medication' },
  ]);

  useEffect(() => {
    const initialMoods: MoodData[] = [
      { date: 'Mon', score: 6, engagement: 5 },
      { date: 'Tue', score: 7, engagement: 8 },
      { date: 'Wed', score: 5, engagement: 4 },
      { date: 'Thu', score: 8, engagement: 9 },
      { date: 'Fri', score: 9, engagement: 7 },
      { date: 'Sat', score: 8, engagement: 10 },
      { date: 'Sun', score: 9, engagement: 6 },
    ];
    setMoodHistory(initialMoods);
    const savedMemories = localStorage.getItem('memories');
    if (savedMemories) setMemories(JSON.parse(savedMemories));
  }, []);

  const handleToggleRoutine = (id: string) => {
    setRoutineTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); setAppState(AppState.ONBOARDING); };
  const handleOnboarding = (name: string) => { 
    setProfile({ name: name || 'Friend', age: 75, interests: ['Gardening', 'Classic Jazz'] }); 
    setAppState(AppState.DASHBOARD); 
  };
  const handleMemoryGenerated = (memory: MemoryEntry) => { const updated = [memory, ...memories]; setMemories(updated); localStorage.setItem('memories', JSON.stringify(updated)); };
  const handleMoodAnalyzed = (mood: { joy: number, engagement: number }) => { const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }); setMoodHistory(prev => [...prev.slice(1), { date: today, score: mood.joy, engagement: mood.engagement }]); };

  if (appState === AppState.AUTH) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] p-10 senior-card text-center border-4 border-sky-100">
          <div className="w-24 h-24 bg-sky-600 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white text-5xl font-bold shadow-xl rotate-3">G</div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">GoldenYears</h1>
          <p className="text-slate-600 mb-10 text-xl font-medium">Empathetic companionship for every day.</p>
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="text-left">
              <label className="block text-slate-800 font-black mb-3 text-2xl">Email or Phone</label>
              <input 
                type="text" 
                placeholder="Enter here..."
                className="w-full p-6 rounded-2xl border-4 border-slate-300 bg-white focus:border-sky-600 outline-none text-2xl text-black font-bold placeholder-slate-400 shadow-inner transition-all" 
              />
            </div>
            <button className="w-full bg-sky-600 text-white py-6 rounded-3xl font-black text-3xl hover:bg-sky-700 transition-all shadow-xl active:scale-95">
              Let's Start
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (appState === AppState.ONBOARDING) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-[40px] p-12 senior-card text-center border-4 border-sky-200">
          <span className="text-7xl mb-6 block">👋</span>
          <h2 className="text-5xl font-black text-slate-900 mb-6">Welcome Home!</h2>
          <p className="text-2xl text-slate-700 mb-12 font-medium">I'm Goldie, your new AI companion. What is your name?</p>
          <div className="flex flex-col gap-6">
            <input 
              id="userNameInput" 
              type="text" 
              placeholder="Type your name here..." 
              className="w-full p-8 rounded-3xl border-4 border-sky-300 bg-white focus:border-sky-600 text-3xl text-black font-bold placeholder-slate-400 shadow-inner outline-none" 
              autoFocus 
            />
            <button 
              onClick={() => handleOnboarding((document.getElementById('userNameInput') as HTMLInputElement).value)} 
              className="bg-sky-600 text-white p-6 rounded-3xl font-black text-3xl hover:bg-sky-700 transition-all shadow-xl"
            >
              Start My Journey
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout activeState={appState} onNavigate={setAppState} userName={profile?.name}>
      {appState === AppState.DASHBOARD && <Dashboard moodHistory={moodHistory} memories={memories} onStartCompanion={() => setAppState(AppState.COMPANION)} />}
      {appState === AppState.COMPANION && <Companion onMemoryGenerated={handleMemoryGenerated} onMoodAnalyzed={handleMoodAnalyzed} />}
      {appState === AppState.ROUTINE && <Routine tasks={routineTasks} onToggleTask={handleToggleRoutine} />}
      {appState === AppState.REMINISCENCE && (
        <div className="space-y-6">
          <h2 className="text-4xl font-black text-slate-900">Your Shared Memories</h2>
          {memories.length === 0 ? (
            <div className="bg-white p-12 rounded-[40px] text-center senior-card border-4 border-dashed border-slate-200">
              <span className="text-7xl block mb-6">📸</span>
              <p className="text-2xl text-slate-500 font-bold">No memories captured yet! Start a chat with Goldie.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {memories.map((m) => (
                <div key={m.id} className="bg-white p-6 rounded-[40px] senior-card border-2 border-slate-100">
                  <img src={m.imageUrl} className="w-full aspect-video rounded-3xl object-cover mb-4" />
                  <h3 className="text-2xl font-black text-slate-900">{m.title}</h3>
                  <p className="text-slate-600 text-lg">{m.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;
