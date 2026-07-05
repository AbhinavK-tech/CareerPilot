import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Workflow, 
  Database, 
  GitCompare, 
  BookOpen, 
  Briefcase, 
  UserCheck, 
  Binary, 
  CheckCircle2, 
  GitBranch 
} from 'lucide-react';

export const ArchDiagram: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string>('Orchestrator');

  const agents = [
    {
      name: 'Orchestrator',
      icon: Workflow,
      color: '#6366f1', // Indigo
      role: 'Coordinates specialized sub-agents sequentially to construct the complete career profile.',
      input: 'User Resume (PDF) & Preference (hours/speed)',
      output: 'Coordinated dataset saved to database, driving the user dashboard',
      tools: 'FastAPI Router, SQLAlchemy Session Managers',
      prompt: 'Maintains transactional limits, sequences analysis pipelines, triggers progress calculates, and manages fallbacks.'
    },
    {
      name: 'Resume Analyzer',
      icon: Cpu,
      color: '#14b8a6', // Teal
      role: 'Parses resume strings to score ATS format compatibility and find layout compliance.',
      input: 'Raw Resume Text content',
      output: 'ATS score, Strengths list, Weaknesses checklist, Suggestions list',
      tools: 'PyPDF extraction engine, Gemini LLM Reasoning API',
      prompt: 'Act as a professional recruiter. Verify sections (Education, Projects). Extract text, analyze metrics, and score ATS compliance.'
    },
    {
      name: 'Skill Gap Agent',
      icon: GitCompare,
      color: '#3b82f6', // Blue
      role: 'Cross-references current skills against standard requirements for target industry role.',
      input: 'Resume skills lists vs Target Role description expectations',
      output: 'Missing skills lists, prioritized learning gaps, overall matching percentage',
      tools: 'Gemini Technical Role Taxonomies API',
      prompt: 'Identify missing core capabilities. Rate missing priorities as High, Medium, or Low depending on role dependencies.'
    },
    {
      name: 'Career Planner',
      icon: BookOpen,
      color: '#ec4899', // Pink
      role: 'Builds tailored chronological milestones (30/90/180/360 days roadmap tasks).',
      input: 'Target role, missing skills checklist, pacing preferences, weekly available hours',
      output: 'List of structured weekly milestones including titles, descriptions, and reference resources',
      tools: 'Gemini Curriculum generation engine',
      prompt: 'Generate chronological study roadmaps. Sequence logically from base principles to cloud deployment and portfolios.'
    },
    {
      name: 'Learning Resource Agent',
      icon: CheckCircle2,
      color: '#10b981', // Emerald
      role: 'Gathers top-tier study references across YouTube, Kaggle, GitHub, and docs.',
      input: 'Missing skillsets',
      output: 'Filtered list of title URLs, sources, and difficulty ranges',
      tools: 'Gemini Reference Search API, simulated web queries',
      prompt: 'Select non-duplicate learning material. Ensure URL paths are descriptive, high quality, and free.'
    },
    {
      name: 'Project Recommender',
      icon: Briefcase,
      color: '#a855f7', // Purple
      role: 'Recommends code-level portfolio-building templates to acquire missing skill layers.',
      input: 'Missing skillsets, difficulty level',
      output: 'Detailed project specs with portfolio impact rating and complete folder tree layouts',
      tools: 'Gemini System Architecture generator API',
      prompt: 'Recommend robust distributed architectures. Output project folders tree representation using ASCII.'
    },
    {
      name: 'Interview Coach',
      icon: UserCheck,
      color: '#f43f5e', // Rose
      role: 'Generates mock tech question pools and rates user textual answers.',
      input: 'Target role, session question indexes, user text answers',
      output: 'Question-level scores, feedback comments, model answers, and session summary logs',
      tools: 'Gemini Mock Interview Evaluator API',
      prompt: 'Act as a hiring manager. Rate answers on communication, clarity, and system detail. Provide high quality exemplars.'
    },
    {
      name: 'DSA Coach',
      icon: Binary,
      color: '#f59e0b', // Amber
      role: 'Drafts LeetCode style topic plans and checklist practice progression.',
      input: 'Target role difficulty limits',
      output: '5-day timeline calendar tasks, array hashing, tree topics, problem links',
      tools: 'Gemini Coding Curriculum API',
      prompt: 'Map algorithm questions from Easy to Hard. Support daily schedule progression checklists.'
    },
    {
      name: 'GitHub Review Agent',
      icon: GitBranch,
      color: '#94a3b8', // Slate
      role: 'Audits folder layouts, README quality, and documentation specs of public repos.',
      input: 'Public repository URL string',
      output: 'Subscores (README, Doc, commits, clean code), summary audit comments, improvements checklist',
      tools: 'Gemini Code Inspector API, Public GitHub API requests',
      prompt: 'Parse URL repositories. Assess architectural cleanliness and suggest production improvements.'
    },
    {
      name: 'Progress Tracker',
      icon: Database,
      color: '#06b6d4', // Cyan
      role: 'Aggregates statistics and calculates the global Job Readiness Index (JRI).',
      input: 'Skill gaps matching rate, ATS score, mock interview ratings, projects completions, DSA progress',
      output: 'Updated Progress database models, streaks, JRI score out of 100',
      tools: 'SQLAlchemy database engines, progress metrics calculators',
      prompt: 'Maintains JRI score calculations (Weights: 30% Skill, 20% ATS, 20% Interview, 15% Github, 15% DSA).'
    }
  ];

  const activeAgent = agents.find(a => a.name === selectedAgent) || agents[0];
  const ActiveIcon = activeAgent.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight m-0 font-display">Multi-Agent System Architecture</h2>
        <p className="text-xs text-brand-muted m-0 mt-1">Trace workflow nodes, orchestrators, databases, and operational agent prompts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Graph Node Selection grid */}
        <div className="lg:col-span-2 glass p-6 rounded-3xl space-y-6 border border-brand-border/40">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 m-0 flex items-center gap-2 font-display">
            <Workflow className="w-4 h-4 text-brand-teal" />
            Agent Interactive Topology Map
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const isSelected = selectedAgent === agent.name;
              return (
                <button
                  key={agent.name}
                  onClick={() => setSelectedAgent(agent.name)}
                  className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 bg-transparent ${
                    isSelected 
                      ? 'border-[2px]' 
                      : 'border-brand-border hover:border-brand-border/80'
                  }`}
                  style={{ 
                    borderColor: isSelected ? agent.color : undefined,
                    backgroundColor: isSelected ? `${agent.color}08` : undefined
                  }}
                >
                  <div className="flex justify-between items-start w-full">
                    <span 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${agent.color}15`, color: agent.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span 
                      className="w-1.5 h-1.5 rounded-full animate-ping" 
                      style={{ backgroundColor: agent.color, animationDuration: '3s' }}
                    ></span>
                  </div>
                  <span className="text-xs font-bold text-white mt-3 block leading-tight font-display">{agent.name}</span>
                </button>
              );
            })}
          </div>

          {/* Database System info block */}
          <div className="bg-brand-darker/60 border border-brand-border p-5 rounded-2xl flex items-start gap-4">
            <Database className="w-6 h-6 text-brand-teal shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider m-0 font-display">SQLAlchemy Database Persistence layer</h4>
              <p className="text-xs text-brand-muted leading-relaxed m-0 font-sans">
                All metrics are saved inside an SQLite relational storage layout. When roadmap tasks are toggled, interview scores log, or DSA problems solve, updates trigger database records writes, synchronizing the JRI score instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Node Details Sidecard */}
        <motion.div 
          layoutId="activeAgentCard"
          className="glass p-8 rounded-3xl space-y-6 border border-brand-border/60"
        >
          <div className="flex gap-4 items-center border-b border-brand-border/60 pb-4">
            <span 
              className="p-3 rounded-2xl shrink-0" 
              style={{ backgroundColor: `${activeAgent.color}15`, color: activeAgent.color }}
            >
              <ActiveIcon className="w-6 h-6" />
            </span>
            <div>
              <span className="text-[9px] text-brand-muted uppercase font-bold tracking-wider">Operational Node</span>
              <h3 className="text-base font-bold text-white m-0 font-display">{activeAgent.name}</h3>
            </div>
          </div>

          <div className="space-y-4 text-xs text-brand-muted leading-relaxed font-sans">
            <div>
              <strong className="text-white block mb-0.5 font-display">Responsibility:</strong>
              <p className="m-0">{activeAgent.role}</p>
            </div>

            <div>
              <strong className="text-white block mb-0.5 font-display">Workflow inputs:</strong>
              <p className="m-0 text-slate-300">{activeAgent.input}</p>
            </div>

            <div>
              <strong className="text-white block mb-0.5 font-display">Workflow outputs:</strong>
              <p className="m-0 text-slate-300">{activeAgent.output}</p>
            </div>

            <div>
              <strong className="text-white block mb-0.5 font-display">Sub-Agent Tools:</strong>
              <p className="m-0 text-brand-teal font-mono">{activeAgent.tools}</p>
            </div>

            <div className="border-t border-brand-border/60 pt-4 mt-4">
              <strong className="text-white block mb-1 font-display">Operational Instructions Prompt:</strong>
              <p className="m-0 italic bg-brand-darker/60 p-4 rounded-xl border border-brand-border leading-relaxed">
                "{activeAgent.prompt}"
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default ArchDiagram;
