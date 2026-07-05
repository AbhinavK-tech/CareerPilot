import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, LayoutGrid } from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const GitHubReview: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [review, setReview] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setLoading(true);
    setReview(null);

    try {
      const res = await api.post<any>('/api/copilot/github-review', {
        repo_url: repoUrl
      });
      setReview(res);

      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#6366f1', '#10b981']
      });
    } catch (err) {
      console.error(err);
      alert('GitHub Analysis failed. Make sure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight m-0 font-display">GitHub Portfolio Auditor</h2>
        <p className="text-xs text-brand-muted m-0 mt-1">Audit public repositories to assess code structure, README clarity, and documentation metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form / Report */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form */}
          <div className="glass p-6 rounded-2xl border border-brand-border/40">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 m-0 font-display">Repository Input</h3>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="relative flex-1">
                <GithubIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="url"
                  required
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/project-repo"
                  className="w-full bg-brand-darker border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent rounded-xl py-3 pl-12 pr-4 text-xs text-white placeholder-brand-muted/40 transition-all outline-none font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
              >
                {loading ? 'Analyzing...' : 'Audit Codebase'}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Review Report Display */}
          {review && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-3xl space-y-8 border border-brand-border/60"
            >
              {/* Overall Header */}
              <div className="flex justify-between items-start border-b border-brand-border/60 pb-6">
                <div>
                  <span className="text-[9px] text-brand-teal uppercase font-bold tracking-wider">Repository Review Results</span>
                  <h3 className="text-lg font-bold text-white m-0 mt-0.5 font-display">{review.repo_name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-brand-teal font-display">{review.overall_score}%</span>
                  <span className="block text-[8px] text-brand-muted uppercase font-bold tracking-wider mt-1">Overall Rating</span>
                </div>
              </div>

              {/* Subscores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { name: 'README Doc', score: review.readme_score },
                  { name: 'Developer Guide', score: review.documentation_score },
                  { name: 'Clean Code', score: review.structure_score },
                  { name: 'Commit Styles', score: review.commits_score },
                  { name: 'Complexity', score: review.complexity_score },
                ].map((item) => (
                  <div key={item.name} className="bg-brand-darker/40 border border-brand-border p-3.5 rounded-xl text-center">
                    <span className="text-[8px] font-bold text-brand-muted uppercase block leading-none mb-2 font-display">{item.name}</span>
                    <span className="text-base font-extrabold text-white font-display">{item.score}%</span>
                  </div>
                ))}
              </div>

              {/* Comments block */}
              <div className="bg-brand-card/40 border border-brand-border p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-display">AI Code Auditor Feedback</h4>
                <p className="text-xs text-brand-muted leading-relaxed m-0 font-sans">{review.comments}</p>
              </div>

              {/* Actionable suggestions checklist */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-display">Recommended Code Fixes</h4>
                <div className="space-y-3">
                  {review.improvements.map((imp: string) => (
                    <div key={imp} className="flex gap-3 items-start text-xs text-brand-text/80">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                      <p className="m-0 leading-relaxed font-sans">{imp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Directory structure panel */}
        {review && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 rounded-2xl space-y-4 border border-brand-border/40"
          >
            <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0 flex items-center gap-2 font-display">
              <LayoutGrid className="w-4 h-4 text-brand-teal" />
              Proposed File Tree
            </h3>
            
            <div className="bg-brand-darker border border-brand-border p-4 rounded-xl font-mono text-[9px] text-brand-muted overflow-x-auto whitespace-pre leading-relaxed">
              <pre className="m-0">{review.folder_structure}</pre>
            </div>
            <span className="text-[8px] text-brand-muted italic block text-center">AI recommendations to align repository with industrial paradigms.</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default GitHubReview;
