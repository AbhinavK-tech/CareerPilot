import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, CheckSquare, Square, CheckCircle2, Trophy } from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const DSACoach: React.FC = () => {
  const [plan, setPlan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'schedule'>('roadmap');
  const [loading, setLoading] = useState(true);

  const fetchDSAPlan = async () => {
    try {
      const res = await api.get<any>('/api/dsa/plan');
      setPlan(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDSAPlan();
  }, []);

  const handleToggleQuestion = async (topic: string, questionTitle: string) => {
    try {
      await api.put('/api/dsa/toggle', {
        topic,
        question_title: questionTitle
      });

      confetti({
        particleCount: 50,
        spread: 40,
        colors: ['#38bdf8', '#10b981']
      });

      await fetchDSAPlan();
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

  const completedQuestions = plan?.practice_progress?.completed_questions || [];
  const completedTopics = plan?.practice_progress?.completed_topics || [];
  const totalQuestions = plan?.topic_roadmap?.reduce((acc: number, item: any) => acc + item.questions.length, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight m-0 font-display">DSA Coach Hub</h2>
          <p className="text-xs text-brand-muted m-0 mt-1">Hone your runtime complexity optimization and algorithmic problem solving.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-brand-darker p-1 rounded-xl border border-brand-border">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'roadmap' 
                ? 'bg-brand-accent text-white shadow-md' 
                : 'text-brand-muted hover:text-white'
            }`}
          >
            Topic Roadmaps
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'schedule' 
                ? 'bg-brand-accent text-white shadow-md' 
                : 'text-brand-muted hover:text-white'
            }`}
          >
            Daily Checklist
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-brand-border/40">
          <div className="w-12 h-12 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] text-brand-muted uppercase font-bold tracking-wider">Solved Exercises</span>
            <h4 className="text-lg font-extrabold text-white m-0 mt-0.5 font-display">{completedQuestions.length} / {totalQuestions} solved</h4>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-brand-border/40">
          <div className="w-12 h-12 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] text-brand-muted uppercase font-bold tracking-wider">Completed Topics</span>
            <h4 className="text-lg font-extrabold text-white m-0 mt-0.5 font-display">{completedTopics.length} sections cleared</h4>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-brand-border/40">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] text-brand-muted uppercase font-bold tracking-wider">Algorithm Pacing</span>
            <h4 className="text-lg font-extrabold text-white m-0 mt-0.5 font-display">
              {totalQuestions > 0 ? `${Math.round((completedQuestions.length / totalQuestions) * 100)}%` : '0%'} Completed
            </h4>
          </div>
        </div>
      </div>

      {activeTab === 'roadmap' ? (
        /* Topic Roadmap List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plan?.topic_roadmap?.map((topicItem: any, idx: number) => {
            const isTopicCompleted = completedTopics.includes(topicItem.topic);
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={topicItem.topic}
                className="glass p-6 rounded-2xl border border-brand-border space-y-4 glass-interactive"
              >
                <div className="flex justify-between items-center border-b border-brand-border/60 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0 font-display">{topicItem.topic}</h3>
                  {isTopicCompleted && (
                    <span className="bg-brand-teal/20 text-brand-teal px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                      Cleared
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {topicItem.questions.map((q: any) => (
                    <div 
                      key={q.title}
                      className="flex items-center justify-between bg-brand-darker/40 p-3 rounded-xl border border-brand-border/60 hover:border-brand-accent/30 transition-all cursor-pointer"
                      onClick={() => handleToggleQuestion(topicItem.topic, q.title)}
                    >
                      <div className="flex items-center gap-3">
                        {q.completed ? (
                          <CheckSquare className="w-4 h-4 text-brand-teal shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-brand-text/40 shrink-0" />
                        )}
                        <span className={`text-xs font-semibold ${q.completed ? 'line-through text-brand-muted' : 'text-white'}`}>
                          {q.title}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Daily Checklist Schedule */
        <div className="glass p-8 rounded-3xl space-y-6 border border-brand-border/40">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0 font-display">Day-by-Day training guide</h3>
          
          <div className="space-y-4">
            {plan?.daily_schedule?.map((item: any) => (
              <div 
                key={item.day}
                className="bg-brand-darker/40 border border-brand-border p-5 rounded-2xl flex items-start gap-4"
              >
                <div className="bg-brand-accent/15 text-brand-accent px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 font-display">
                  Day {item.day}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider m-0 font-display">{item.topic}</h4>
                  <p className="text-xs text-brand-muted leading-relaxed m-0 font-sans">{item.task}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default DSACoach;
