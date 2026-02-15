
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Companion from './components/Companion';
import Routine from './components/Routine';
import { AppState, UserProfile, MoodData, MemoryEntry, RoutineTask, Settings } from './types';
import { Icons } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [isSignUp, setIsSignUp] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('goldie_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [settings, setSettings] = useState<Settings>({ fontSize: 'large', contrast: 'normal' });
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>([
    { id: '1', time: '08:00 AM', title: 'Morning Vitamin', description: 'Take 1 blue vitamin.', completed: false, type: 'medication' },
    { id: '2', time: '10:30 AM', title: 'Garden Walk', description: '10 mins of fresh air.', completed: false, type: 'activity' },
    { id: '3', time: '01:00 PM', title: 'Lunch Time', description: 'Something warm.', completed: false, type: 'meal' },
  ]);

  useEffect(() => {
    const initialMoods: MoodData[] = [
      { date: 'Mon', score: 8, engagement: 7, energy: 6 },
      { date: 'Tue', score: 7, engagement: 8, energy: 7 },
      { date: 'Wed', score: 9, engagement: 9, energy: 8 },
      { date: 'Thu', score: 8, engagement: 9, energy: 7 },
      { date: 'Fri', score: 9, engagement: 8, energy: 9 },
      { date: 'Sat', score: 10, engagement: 10, energy: 9 },
      { date: 'Sun', score: 9, engagement: 9, energy: 8 },
    ];
    setMoodHistory(initialMoods);
    const savedMemories = localStorage.getItem('memories');
    if (savedMemories) setMemories(JSON.parse(savedMemories));
    if (profile) setAppState(AppState.DASHBOARD);
  }, []);

  const handleToggleRoutine = (id: string) => {
    setRoutineTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppState(AppState.ONBOARDING);
  };

  const handleOnboarding = (name: string) => {
    const newProfile: UserProfile = { 
      name: name || 'Friend', 
      age: 75, 
      interests: ['Gardening', 'Classical Music'],
      emergencyContact: { name: 'Family Member', phone: '555-0199' }
    };
    setProfile(newProfile);
    localStorage.setItem('goldie_profile', JSON.stringify(newProfile));
    setAppState(AppState.DASHBOARD);
  };

  const handleMemoryGenerated = (memory: MemoryEntry) => {
    const updated = [memory, ...memories];
    setMemories(updated);
    localStorage.setItem('memories', JSON.stringify(updated));
  };

  const handleMoodAnalyzed = (mood: { joy: number, engagement: number, energy: number }) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    setMoodHistory(prev => [...prev.slice(1), { date: today, score: mood.joy, engagement: mood.engagement, energy: mood.energy }]);
  };

  const fontSizeClass = settings.fontSize === 'extra-large' ? 'text-3xl' : settings.fontSize === 'large' ? 'text-2xl' : 'text-xl';
  const contrastClass = settings.contrast === 'high' ? 'bg-black text-yellow-400' : 'bg-slate-50 text-slate-900';

  if (appState === AppState.AUTH) {
    return (
      <div className={`min-h-screen ${contrastClass} flex items-center justify-center p-4`}>
        <div className="max-w-md w-full bg-white rounded-[30px] sm:rounded-[40px] p-6 sm:p-10 senior-card text-center border-4 border-sky-100 shadow-2xl">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-sky-600 rounded-3xl mx-auto mb-4 sm:mb-6 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-xl rotate-3">G</div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">GoldenYears</h1>
          <p className="text-slate-600 mb-8 sm:mb-10 text-lg sm:text-xl font-medium">Your daily AI companion.</p>
          
          <div className="flex gap-2 mb-6 sm:mb-8 bg-slate-100 p-2 rounded-2xl">
            <button onClick={() => setIsSignUp(false)} className={`flex-1 py-3 rounded-xl font-black text-base sm:text-lg transition-all ${!isSignUp ? 'bg-white shadow-md text-sky-600' : 'text-slate-500'}`}>Sign In</button>
            <button onClick={() => setIsSignUp(true)} className={`flex-1 py-3 rounded-xl font-black text-base sm:text-lg transition-all ${isSignUp ? 'bg-white shadow-md text-sky-600' : 'text-slate-500'}`}>Sign Up</button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 sm:space-y-6">
            <div className="text-left">
              <label className="block text-slate-800 font-black mb-1 sm:mb-2 text-lg sm:text-xl">{isSignUp ? 'Name' : 'Login'}</label>
              <input type="text" placeholder={isSignUp ? "Name..." : "Login..."} className="w-full p-4 sm:p-6 rounded-2xl border-4 border-slate-200 bg-white focus:border-sky-600 outline-none text-xl sm:text-2xl text-black font-bold shadow-inner" required />
            </div>
            <button className="w-full bg-sky-600 text-white py-4 sm:py-6 rounded-3xl font-black text-2xl sm:text-3xl hover:bg-sky-700 transition-all shadow-xl">
              {isSignUp ? 'Create' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (appState === AppState.ONBOARDING) {
    return (
      <div className={`min-h-screen bg-sky-50 flex items-center justify-center p-4 ${fontSizeClass}`}>
        <div className="max-w-2xl w-full bg-white rounded-[30px] sm:rounded-[40px] p-6 sm:p-12 senior-card text-center border-4 border-sky-200">
          <span className="text-5xl sm:text-7xl mb-4 sm:mb-6 block">👋</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 sm:mb-6">Welcome!</h2>
          <p className="text-xl sm:text-2xl text-slate-700 mb-8 sm:mb-12 font-medium italic">"What should I call you?"</p>
          <div className="flex flex-col gap-4 sm:gap-6">
            <input id="userNameInput" type="text" placeholder="Type here..." className="w-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-4 border-sky-300 bg-white focus:border-sky-600 text-2xl sm:text-3xl text-black font-bold outline-none shadow-inner" autoFocus />
            <button onClick={() => handleOnboarding((document.getElementById('userNameInput') as HTMLInputElement).value)} className="bg-sky-600 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl font-black text-2xl sm:text-3xl hover:bg-sky-700 shadow-xl">Start</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout activeState={appState} onNavigate={setAppState} userName={profile?.name} settings={settings}>
      <div className={`${fontSizeClass} ${settings.contrast === 'high' ? 'contrast-high' : ''} h-full`}>
        {appState === AppState.DASHBOARD && <Dashboard moodHistory={moodHistory} memories={memories} onStartCompanion={() => setAppState(AppState.COMPANION)} />}
        {appState === AppState.COMPANION && <Companion userProfile={profile!} onMemoryGenerated={handleMemoryGenerated} onMoodAnalyzed={handleMoodAnalyzed} />}
        {appState === AppState.ROUTINE && <Routine tasks={routineTasks} onToggleTask={handleToggleRoutine} />}
        {appState === AppState.REMINISCENCE && (
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 px-2">Memory Wall</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              {memories.map((m) => (
                <div key={m.id} className="bg-white p-4 sm:p-6 rounded-[30px] sm:rounded-[40px] senior-card border-2 border-slate-100 shadow-lg">
                  <img src={m.imageUrl} className="w-full aspect-video rounded-2xl sm:rounded-3xl object-cover mb-4" />
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{m.title}</h3>
                  <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {appState === AppState.HISTORY && (
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 px-2">Past Chats</h2>
            <div className="bg-white rounded-[30px] sm:rounded-[40px] p-4 sm:p-8 senior-card border-2 border-slate-50">
              <div className="space-y-2 sm:space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-100 hover:bg-slate-50 rounded-2xl sm:rounded-3xl cursor-pointer">
                    <div className="max-w-[80%]">
                      <p className="text-xl sm:text-2xl font-black text-slate-800">Feb {10 + i}</p>
                      <p className="text-lg sm:text-xl text-slate-500 font-bold truncate">Stories about home.</p>
                    </div>
                    <div className="text-sky-600 font-black text-lg sm:text-xl">➔</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {appState === AppState.SETTINGS && (
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 px-2">Accessibility</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] senior-card border-4 border-slate-100">
                <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">Text Size</h3>
                <div className="flex flex-col gap-3">
                  {['standard', 'large', 'extra-large'].map((size) => (
                    <button key={size} onClick={() => setSettings(s => ({...s, fontSize: size as any}))} className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 sm:border-4 font-black text-xl sm:text-2xl capitalize ${settings.fontSize === size ? 'border-sky-600 bg-sky-50 text-sky-700' : 'border-slate-200'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] senior-card border-4 border-slate-100">
                <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">Colors</h3>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setSettings(s => ({...s, contrast: 'normal'}))} className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 sm:border-4 font-black text-xl sm:text-2xl ${settings.contrast === 'normal' ? 'border-sky-600 bg-sky-50 text-sky-700' : 'border-slate-200'}`}>Standard Blue</button>
                  <button onClick={() => setSettings(s => ({...s, contrast: 'high'}))} className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 sm:border-4 font-black text-xl sm:text-2xl ${settings.contrast === 'high' ? 'border-sky-600 bg-sky-50 text-sky-700' : 'border-slate-200'}`}>High Contrast</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {appState === AppState.EMERGENCY && (
          <div className="space-y-6 sm:space-y-10">
            <div className="bg-red-50 border-4 border-red-200 p-6 sm:p-10 rounded-[30px] sm:rounded-[40px] text-center senior-card">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-600 text-white rounded-full mx-auto flex items-center justify-center mb-4 sm:mb-6 shadow-2xl">
                <Icons.Alert />
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-red-900 mb-2 sm:mb-4">Quick Help</h2>
              <p className="text-lg sm:text-2xl text-red-700 font-bold mb-6 sm:mb-10">Press the button to notify your family.</p>
              <button onClick={() => alert(`Calling family...`)} className="w-full bg-red-600 text-white py-8 sm:py-12 rounded-[20px] sm:rounded-[40px] font-black text-4xl sm:text-6xl hover:bg-red-700 shadow-2xl transition-all active:scale-95">SOS CALL</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
