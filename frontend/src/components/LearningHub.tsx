import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Briefcase, 
  ExternalLink, 
  CheckCircle, 
  FolderCheck,
  ChevronDown,
  ChevronUp,
  LayoutGrid
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const LearningHub: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const fetchHubData = async () => {
    try {
      const [res, proj] = await Promise.all([
        api.get<any[]>('/api/copilot/resources'),
        api.get<any[]>('/api/copilot/projects')
      ]);
      setResources(res);
      setProjects(proj);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, []);

  const handleToggleResource = async (id: number) => {
    try {
      const res = await api.put<any>(`/api/copilot/resources/${id}/toggle`);
      if (res.completed) {
        confetti({
          particleCount: 40,
          spread: 30,
          colors: ['#10b981', '#6366f1']
        });
      }
      await fetchHubData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleProject = async (id: number) => {
    try {
      const res = await api.put<any>(`/api/copilot/projects/${id}/toggle`);
      if (res.completed) {
        confetti({
          particleCount: 80,
          spread: 50,
          colors: ['#10b981', '#6366f1']
        });
      }
      await fetchHubData();
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight m-0 font-display">Learning Hub & Recommendations</h2>
        <p className="text-xs text-brand-muted m-0 mt-1">Check out study material curated dynamically for your profile and goals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Recommended Learning Resources */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0 flex items-center gap-2 font-display">
              <BookOpen className="w-4 h-4 text-brand-teal" />
              Curated study materials
            </h3>
            <span className="text-[9px] text-brand-muted bg-brand-darker px-2.5 py-1 rounded-xl border border-brand-border text-xs font-bold font-display">
              {resources.filter(r => r.completed).length} / {resources.length} completed
            </span>
          </div>

          <div className="space-y-3">
            {resources.length === 0 ? (
              <p className="text-xs text-brand-muted italic m-0">No active resources found. Upload a resume to seed recommendations.</p>
            ) : (
              resources.map((item) => (
                <div 
                  key={item.id}
                  className={`bg-brand-darker/40 border p-4 rounded-xl flex items-center justify-between gap-4 transition-all glass-interactive ${
                    item.completed ? 'border-brand-teal/35 bg-brand-teal/5' : 'border-brand-border'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="bg-brand-border text-brand-text/80 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                        {item.skill}
                      </span>
                      <span className="bg-brand-accent/15 text-brand-accent px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-display">
                        {item.source}
                      </span>
                      <span className="bg-brand-dark text-slate-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                        {item.difficulty}
                      </span>
                    </div>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-semibold text-white hover:text-brand-accent transition-colors flex items-center gap-1.5 truncate font-display"
                    >
                      {item.title}
                      <ExternalLink className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                    </a>
                  </div>

                  <button
                    onClick={() => handleToggleResource(item.id)}
                    className="p-1 rounded-lg hover:bg-brand-border/40 transition-colors border-none bg-transparent cursor-pointer shrink-0"
                  >
                    <CheckCircle className={`w-5 h-5 ${item.completed ? 'text-brand-teal fill-brand-teal/10' : 'text-brand-text/30 hover:text-brand-accent'}`} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Portfolio Projects */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0 flex items-center gap-2 font-display">
              <Briefcase className="w-4 h-4 text-brand-accent" />
              Tailored Portfolio Projects
            </h3>
            <span className="text-[9px] text-brand-muted bg-brand-darker px-2.5 py-1 rounded-xl border border-brand-border text-xs font-bold font-display">
              {projects.filter(p => p.completed).length} / {projects.length} built
            </span>
          </div>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-xs text-brand-muted italic m-0">No custom projects loaded. Seed profile from command dashboard.</p>
            ) : (
              projects.map((project) => {
                const isExpanded = expandedProject === project.id;
                return (
                  <div 
                    key={project.id}
                    className={`bg-brand-darker/40 border rounded-2xl transition-all overflow-hidden glass ${
                      project.completed ? 'border-brand-teal/35 bg-brand-teal/5' : 'border-brand-border hover:border-brand-accent/20'
                    }`}
                  >
                    <div className="p-5 flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-brand-accent/15 text-brand-accent px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-display">
                            {project.difficulty}
                          </span>
                          <span className="bg-brand-dark text-slate-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                            ⌚ {project.duration}
                          </span>
                          <span className="bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-display">
                            Impact: {project.portfolio_impact}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white m-0 leading-none font-display">{project.title}</h4>
                        <p className="text-xs text-brand-muted leading-relaxed m-0 font-sans">{project.description}</p>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleProject(project.id)}
                          className="p-1 rounded-lg hover:bg-brand-border/40 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <FolderCheck className={`w-5 h-5 ${project.completed ? 'text-brand-teal fill-brand-teal/10' : 'text-brand-text/30 hover:text-brand-accent'}`} />
                        </button>
                        <button
                          onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                          className="p-1 rounded-lg hover:bg-brand-border/40 transition-colors border-none bg-transparent cursor-pointer text-brand-muted hover:text-white"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Workspace detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-brand-darker border-t border-brand-border"
                        >
                          <div className="p-5 space-y-4">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-brand-muted tracking-wider block mb-1 font-display">Target Skillset:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {project.skills_learned?.map((sk: string) => (
                                  <span key={sk} className="bg-brand-border text-brand-text/80 px-2 py-0.5 rounded text-[8px] font-semibold">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {project.folder_structure && (
                              <div>
                                <span className="text-[9px] uppercase font-bold text-brand-muted tracking-wider block mb-2 flex items-center gap-1 font-display">
                                  <LayoutGrid className="w-3.5 h-3.5 text-brand-teal" />
                                  Project Scaffold Structure:
                                </span>
                                <div className="bg-brand-dark border border-brand-border p-3.5 rounded-xl font-mono text-[9px] text-brand-muted overflow-x-auto whitespace-pre leading-relaxed">
                                  <pre className="m-0">{project.folder_structure}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LearningHub;
