
import React from 'react';
import { RoutineTask } from '../types';

interface RoutineProps {
  tasks: RoutineTask[];
  onToggleTask: (id: string) => void;
}

const Routine: React.FC<RoutineProps> = ({ tasks, onToggleTask }) => {
  const sortedTasks = [...tasks].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Daily Routine</h2>
        <div className="bg-sky-100 text-sky-700 px-4 py-1 rounded-full font-bold">
          {tasks.filter(t => t.completed).length} / {tasks.length} Done
        </div>
      </div>

      <div className="space-y-4">
        {sortedTasks.map((task) => (
          <div 
            key={task.id}
            onClick={() => onToggleTask(task.id)}
            className={`group cursor-pointer p-6 rounded-[32px] border-2 transition-all flex items-center gap-6 senior-card ${
              task.completed 
                ? 'bg-emerald-50 border-emerald-100 opacity-75' 
                : 'bg-white border-slate-100 hover:border-sky-300'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-active:scale-90 ${
              task.completed ? 'bg-emerald-200' : 'bg-sky-100'
            }`}>
              {task.completed ? '✅' : task.type === 'medication' ? '💊' : task.type === 'activity' ? '🚶' : '🍱'}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sky-600 font-bold text-lg">{task.time}</span>
                {task.completed && <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Completed</span>}
              </div>
              <h3 className={`text-2xl font-bold transition-all ${
                task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
              }`}>
                {task.title}
              </h3>
              <p className="text-slate-500 text-lg">{task.description}</p>
            </div>

            <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-colors ${
              task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'
            }`}>
              {task.completed && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 p-8 rounded-[40px] border-2 border-amber-100 flex items-start gap-4">
        <span className="text-4xl">💡</span>
        <div>
          <h4 className="text-xl font-bold text-amber-800 mb-1">Goldie's Tip</h4>
          <p className="text-amber-700 text-lg">Maintaining a regular schedule helps keep your mind sharp and your body energetic! You're doing great today.</p>
        </div>
      </div>
    </div>
  );
};

export default Routine;
