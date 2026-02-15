
import React from 'react';
import { RoutineTask } from '../types';
import { Icons } from '../constants';

interface RoutineProps {
  tasks: RoutineTask[];
  onToggleTask: (id: string) => void;
}

const Routine: React.FC<RoutineProps> = ({ tasks, onToggleTask }) => {
  const sortedTasks = [...tasks].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6 h-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-2">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800">Daily Routine</h2>
        <div className="bg-sky-100 text-sky-700 px-4 py-2 rounded-2xl font-black text-lg">
          {tasks.filter(t => t.completed).length} / {tasks.length} Done
        </div>
      </div>

      <div className="space-y-4 px-2">
        {sortedTasks.map((task) => (
          <div 
            key={task.id}
            onClick={() => onToggleTask(task.id)}
            className={`group cursor-pointer p-5 sm:p-8 rounded-2xl sm:rounded-[40px] border-2 transition-all flex items-center gap-4 sm:gap-8 senior-card ${
              task.completed 
                ? 'bg-emerald-50 border-emerald-100 opacity-80' 
                : 'bg-white border-slate-100 hover:border-sky-300'
            }`}
          >
            <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-5xl transition-transform group-active:scale-90 ${
              task.completed ? 'bg-emerald-200' : 'bg-sky-100'
            }`}>
              {task.completed ? '✅' : task.type === 'medication' ? '💊' : task.type === 'activity' ? '🚶' : '🍱'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sky-600 font-black text-base sm:text-2xl">{task.time}</span>
              </div>
              <h3 className={`text-xl sm:text-3xl font-black truncate transition-all ${
                task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
              }`}>
                {task.title}
              </h3>
              <p className="text-slate-500 text-base sm:text-xl font-medium line-clamp-1">{task.description}</p>
            </div>

            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full border-4 flex items-center justify-center shrink-0 transition-colors ${
              task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'
            }`}>
              {task.completed && <Icons.Heart />}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 p-6 sm:p-10 rounded-[30px] sm:rounded-[50px] border-4 border-amber-100 flex items-start gap-4 sm:gap-6 mx-2 shadow-lg">
        <span className="text-4xl sm:text-6xl">💡</span>
        <div>
          <h4 className="text-xl sm:text-2xl font-black text-amber-800 mb-1">Goldie's Tip</h4>
          <p className="text-amber-700 text-lg sm:text-xl font-bold italic leading-relaxed">"You're doing great! Keep it up."</p>
        </div>
      </div>
    </div>
  );
};

export default Routine;
