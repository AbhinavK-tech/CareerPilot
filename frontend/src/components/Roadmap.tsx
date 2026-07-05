import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ExternalLink, CalendarDays } from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const Roadmap: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('30-day');
  const [loading, setLoading] = useState(true);

  const fetchRoadmaps = async () => {
    try {
      const res = await api.get<any[]>('/api/copilot/roadmap');
      setRoadmaps(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleToggleTask = async (taskTitle: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : currentStatus === 'in_progress' ? 'completed' : 'in_progress';
    
    try {
      await api.put('/api/copilot/roadmap/task', {
        term_type: selectedTerm,
        task_title: taskTitle,
        status: nextStatus
      });

      if (nextStatus === 'completed') {
        confetti({
          particleCount: 80,
          spread: 50,
          origin: { y: 0.8 }
        });
      }

      await fetchRoadmaps();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-brand-card rounded-xl w-1/3"></div>
        <div className="h-64 bg-brand-card rounded-2xl"></div>
      </div>
    );
  }

  const activeRoadmap = roadmaps.find(r => r.term_type === selectedTerm);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight m-0 font-display">Career Milestone Roadmaps</h2>
          <p className="text-xs text-brand-muted m-0 mt-1">Acquire lacking technical skills with scheduled weekly deliverables.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-brand-darker p-1 rounded-xl border border-brand-border">
          {['30-day', '90-day'].map((term) => (
            <button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedTerm === term 
                  ? 'bg-brand-accent text-white shadow-md' 
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              {term === '30-day' ? '30-Day Transition' : '90-Day Deep Dive'}
            </button>
          ))}
        </div>
      </div>

      {!activeRoadmap || activeRoadmap.tasks.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center">
          <CalendarDays className="w-12 h-12 text-brand-muted mx-auto mb-4" />
          <h3 className="text-sm font-bold text-white mb-2 font-display">No Active Roadmap Timeline</h3>
          <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
            Please navigate to the Dashboard and upload a resume profile to let the AI agent map your career progression.
          </p>
        </div>
      ) : (
        /* Timeline List */
        <div className="glass p-8 rounded-3xl relative overflow-hidden">
          {/* Vertical Center Line */}
          <div className="absolute left-10 top-12 bottom-12 w-[1px] bg-brand-border hidden sm:block"></div>

          <div className="space-y-8">
            {activeRoadmap.tasks.map((task: any, index: number) => {
              const isCompleted = task.status === 'completed';
              const isInProgress = task.status === 'in_progress';

              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={task.title}
                  className="relative flex flex-col sm:flex-row items-start gap-6 pl-0 sm:pl-10"
                >
                  {/* Status Indicator Icon */}
                  <div className="absolute left-0 top-1.5 z-10 hidden sm:block">
                    <button
                      onClick={() => handleToggleTask(task.title, task.status)}
                      className="bg-brand-dark hover:scale-110 transition-transform cursor-pointer border-none p-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-brand-teal fill-brand-teal/10" />
                      ) : isInProgress ? (
                        <Clock className="w-6 h-6 text-brand-accent animate-spin" style={{ animationDuration: '4s' }} />
                      ) : (
                        <Circle className="w-6 h-6 text-brand-muted hover:text-brand-accent" />
                      )}
                    </button>
                  </div>

                  {/* Task Card Content */}
                  <div className="flex-1 bg-brand-darker/40 border border-brand-border hover:border-brand-accent/30 p-6 rounded-2xl transition-all w-full glass-interactive">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-brand-accent/15 text-brand-accent px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider font-display">
                          Week {task.week}
                        </span>
                        <h4 className="text-sm font-bold text-white m-0 font-display">{task.title}</h4>
                      </div>

                      {/* Mobile Status button */}
                      <button
                        onClick={() => handleToggleTask(task.title, task.status)}
                        className={`sm:hidden self-start px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          isCompleted 
                            ? 'bg-brand-teal/20 text-brand-teal' 
                            : isInProgress 
                            ? 'bg-brand-accent/20 text-brand-accent' 
                            : 'bg-brand-border text-brand-muted'
                        }`}
                      >
                        {task.status}
                      </button>
                    </div>

                    <p className="text-xs text-brand-muted leading-relaxed mb-4 m-0 font-sans">{task.description}</p>

                    {/* Resources */}
                    {task.resources && task.resources.length > 0 && (
                      <div className="border-t border-brand-border/60 pt-4 mt-4">
                        <span className="text-[9px] uppercase font-bold text-brand-muted tracking-wider block mb-2 font-display">Recommended references:</span>
                        <div className="flex flex-wrap gap-2">
                          {task.resources.map((res: string) => (
                            <a
                              key={res}
                              href={`https://docs.google.com/search?q=${encodeURIComponent(res)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-brand-card hover:bg-brand-border text-brand-text/80 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors border border-brand-border"
                            >
                              {res}
                              <ExternalLink className="w-3 h-3 text-brand-teal shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default Roadmap;
