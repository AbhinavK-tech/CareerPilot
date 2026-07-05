import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Send, 
  BookOpen, 
  HelpCircle, 
  CornerDownRight, 
  History,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const InterviewCoach: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get<any[]>('/api/interview/history');
      setHistory(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStartSession = async () => {
    setLoading(true);
    setEvaluationResult(null);
    try {
      const session = await api.post<any>('/api/interview/start');
      setActiveSession(session);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setCurrentAnswer('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (!currentAnswer.trim()) return;
    const qid = activeSession.questions[currentQuestionIndex].id;
    setUserAnswers(prev => ({ ...prev, [qid]: currentAnswer }));
    setCurrentAnswer('');
    
    if (currentQuestionIndex < activeSession.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitInterview();
    }
  };

  const handleSubmitInterview = async () => {
    setEvaluating(true);
    const finalQ = activeSession.questions[currentQuestionIndex];
    const finalAnswers = { ...userAnswers, [finalQ.id]: currentAnswer };
    
    try {
      const result = await api.post<any>('/api/interview/submit', {
        session_id: activeSession.session_id,
        answers: finalAnswers
      });
      
      setEvaluationResult(result);
      setActiveSession(null);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      await fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight m-0 font-display">AI Interview Simulator</h2>
        <p className="text-xs text-brand-muted m-0 mt-1">Practice role-specific mock coding, technical, and behavioral challenges.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!activeSession && !evaluationResult ? (
            /* Lobby State */
            <div className="glass p-12 rounded-3xl text-center flex flex-col items-center border border-brand-border/40">
              <div className="w-16 h-16 rounded-2xl bg-brand-accent/5 flex items-center justify-center mb-6">
                <Terminal className="w-8 h-8 text-brand-accent" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Simulate real technical loops</h3>
              <p className="text-xs text-brand-muted max-w-md mb-8 leading-relaxed">
                Prepare for Google, Netflix, and top-tier startups. Answer questions under mock stress and get immediate scoring reviews.
              </p>
              <button
                onClick={handleStartSession}
                className="bg-brand-accent hover:bg-brand-accent/90 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Mock Interview
              </button>
            </div>
          ) : activeSession ? (
            /* Active Questionnaire Terminal */
            <div className="glass p-8 rounded-3xl flex flex-col h-[520px] justify-between border border-brand-border/60">
              
              {/* Question Navigation */}
              <div className="flex justify-between items-center border-b border-brand-border/60 pb-4 mb-6">
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Question {currentQuestionIndex + 1} of {activeSession.questions.length}</span>
                <span className="bg-brand-accent/15 text-brand-accent px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider font-display">
                  {activeSession.questions[currentQuestionIndex].type}
                </span>
              </div>

              {/* Chat View */}
              <div className="flex-1 flex flex-col justify-between overflow-y-auto mb-6">
                <div className="space-y-6">
                  {/* Coach Question Bubble */}
                  <div className="flex gap-4 items-start max-w-[90%]">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-extrabold text-brand-teal border border-brand-border shrink-0 text-xs">
                      AI
                    </div>
                    <div className="bg-brand-card p-5 rounded-2xl border border-brand-border">
                      <p className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5 font-display">
                        <HelpCircle className="w-4 h-4 text-brand-teal" />
                        {activeSession.questions[currentQuestionIndex].company ? `${activeSession.questions[currentQuestionIndex].company} Technical Question:` : 'Technical Question:'}
                      </p>
                      <p className="text-xs text-brand-text/90 leading-relaxed m-0 font-sans">{activeSession.questions[currentQuestionIndex].question}</p>
                    </div>
                  </div>
                </div>

                {/* Response Input Area */}
                <div className="mt-8">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">Write your response answer:</label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your detailed explanation or system design trade-offs here..."
                      className="w-full bg-brand-darker border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent rounded-2xl p-4 text-xs text-white placeholder-brand-muted/40 transition-all outline-none resize-none font-sans"
                    />
                    <button
                      onClick={handleNextQuestion}
                      disabled={!currentAnswer.trim() || evaluating}
                      className="absolute right-4 bottom-4 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      {currentQuestionIndex < activeSession.questions.length - 1 ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Evaluation Result Screen */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-3xl space-y-8 border border-brand-border/60"
            >
              <div className="flex justify-between items-start border-b border-brand-border/60 pb-6">
                <div>
                  <h3 className="text-lg font-bold text-white m-0 font-display">Evaluation Score Report</h3>
                  <p className="text-[10px] text-brand-muted mt-1 m-0">Feedback committee assessment based on matching metrics.</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-brand-teal font-display">{evaluationResult.score}%</span>
                  <span className="block text-[8px] text-brand-muted uppercase font-bold tracking-wider mt-1">Average Rating</span>
                </div>
              </div>

              <div className="bg-brand-card/40 border border-brand-border p-5 rounded-2xl">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-2 font-display">Hiring Committee Summary</h4>
                <p className="text-xs text-brand-muted leading-relaxed m-0 font-sans">{evaluationResult.overall_summary}</p>
              </div>

              <div className="space-y-6">
                {evaluationResult.feedback.map((item: any) => (
                  <div key={item.question_id} className="border-t border-brand-border/60 pt-6">
                    <h5 className="text-xs font-bold text-white mb-2 font-display">Q{item.question_id}: {item.question}</h5>
                    
                    <div className="space-y-3 pl-4">
                      {/* Your Answer */}
                      <div className="text-xs text-brand-muted leading-relaxed">
                        <strong className="text-brand-accent block mb-1">Your Answer (Score: {item.score}%):</strong>
                        <p className="m-0 italic bg-brand-darker/30 p-3.5 rounded-xl border border-brand-border">"{item.user_answer}"</p>
                      </div>

                      {/* Feedback */}
                      <div className="text-xs text-brand-muted leading-relaxed flex gap-2">
                        <CornerDownRight className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block mb-0.5">Corrections & Feedback:</strong>
                          <p className="m-0">{item.feedback}</p>
                        </div>
                      </div>

                      {/* Model Answer */}
                      <div className="text-xs text-brand-muted leading-relaxed flex gap-2">
                        <BookOpen className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block mb-0.5 font-display">Exemplar correct template:</strong>
                          <p className="m-0 text-slate-300">{item.exemplar}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleStartSession}
                  className="bg-brand-accent hover:bg-brand-accent/90 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Start New Session
                </button>
                <button
                  onClick={() => setEvaluationResult(null)}
                  className="bg-transparent hover:bg-brand-border text-brand-text px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all border border-brand-border cursor-pointer"
                >
                  View History
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar History Panel */}
        <div className="glass p-6 rounded-2xl space-y-6 border border-brand-border/40">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0 flex items-center gap-2 font-display">
            <History className="w-4 h-4 text-brand-teal" />
            Previous Sessions
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-brand-muted italic m-0">No past mock logs located.</p>
            ) : (
              history.map((session) => (
                <div 
                  key={session.session_id} 
                  className="bg-brand-darker/40 hover:bg-brand-darker/70 border border-brand-border p-4 rounded-xl flex justify-between items-center cursor-pointer transition-colors"
                  onClick={() => setEvaluationResult(session)}
                >
                  <div>
                    <span className="text-[9px] text-brand-muted uppercase font-bold">Session #{session.session_id}</span>
                    <p className="text-xs text-brand-muted truncate max-w-[120px] m-0 mt-0.5">{session.overall_summary}</p>
                  </div>
                  <div className="bg-brand-teal/10 text-brand-teal px-2 py-1 rounded-lg text-xs font-extrabold border border-brand-teal/20">
                    {session.score}%
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default InterviewCoach;
