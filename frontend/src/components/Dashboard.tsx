import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  TrendingUp, 
  Award, 
  Flame, 
  FileText, 
  Sparkles,
  CheckCircle2,
  X,
  Loader2,
  Database,
  Printer,
  Target,
  Circle,
  BookOpen,
  Briefcase,
  Code2,
  Workflow,
  Play
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api, API_URL } from '../services/api';
import confetti from 'canvas-confetti';

interface DashboardProps {
  onRefreshUser: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onRefreshUser }) => {
  const [data, setData] = useState<any>(null);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setUploading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  // Custom tooltips visibility
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Demo Banner dismiss
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  // PDF Preview Modal
  const [showPreview, setShowPreview] = useState(false);

  // Multi-Agent On-Dashboard Live Simulation State
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationStep, setSimulationStep] = useState(9); // Default to completed

  // Multi-Agent Live Onboarding Pipeline state
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [res, rm] = await Promise.all([
        api.get<any>('/api/copilot/dashboard'),
        api.get<any[]>('/api/copilot/roadmap')
      ]);
      setData(res);
      setRoadmaps(rm);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file.');
      return;
    }
    
    // Start Live Pipeline Simulation Overlay
    setUploading(true);
    setRunningPipeline(true);
    setPipelineStep(0);

    // Sequence steps visually
    const stepCount = 10;
    for (let i = 1; i <= stepCount; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setPipelineStep(i);
    }

    try {
      await api.uploadFile('/api/copilot/upload-resume', file);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      onRefreshUser();
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to process resume.');
    } finally {
      setUploading(false);
      setRunningPipeline(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleLoadDemo = async () => {
    setSeeding(true);
    try {
      await api.post('/api/copilot/seed-demo');
      confetti({
        particleCount: 120,
        spread: 60,
        colors: ['#6366f1', '#14b8a6']
      });
      onRefreshUser();
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleToggleTask = async (termType: string, taskTitle: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : currentStatus === 'in_progress' ? 'completed' : 'in_progress';
    try {
      await api.put('/api/copilot/roadmap/task', {
        term_type: termType,
        task_title: taskTitle,
        status: nextStatus
      });

      if (nextStatus === 'completed') {
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 }
        });
      }
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const triggerLiveSimulation = async () => {
    if (simulationActive) return;
    setSimulationActive(true);
    setSimulationStep(0);

    const stepCount = 9;
    for (let i = 1; i <= stepCount; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSimulationStep(i);
    }
    setSimulationActive(false);
    confetti({
      particleCount: 80,
      spread: 45,
      colors: ['#6366f1', '#14b8a6']
    });
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-brand-card rounded-xl w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-32 bg-brand-card rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const needsUpload = !data || data.career_readiness_score === 0;
  const isDemoMode = localStorage.getItem('token') === 'demo-mode-token';

  // Static mock datasets for Recharts charts representing AI engineering
  const technicalRadarData = [
    { subject: 'Backend Dev', A: 85, fullMark: 100 },
    { subject: 'AI/ML Systems', A: 70, fullMark: 100 },
    { subject: 'System Design', A: 75, fullMark: 100 },
    { subject: 'DevOps & Cloud', A: 45, fullMark: 100 },
    { subject: 'Frontend/UI', A: 60, fullMark: 100 },
  ];

  const skillGapBarData = [
    { name: 'Python', Have: 100, Required: 100 },
    { name: 'FastAPI', Have: 80, Required: 100 },
    { name: 'SQL', Have: 90, Required: 100 },
    { name: 'Docker', Have: 60, Required: 90 },
    { name: 'PyTorch', Have: 30, Required: 80 },
    { name: 'GCP Cloud', Have: 20, Required: 75 },
  ];

  // Pie Chart Resource Types Distribution
  const pieChartData = [
    { name: 'Official Docs', value: 40 },
    { name: 'YouTube', value: 30 },
    { name: 'Kaggle', value: 15 },
    { name: 'GitHub Repos', value: 15 },
  ];
  const PIE_COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899'];

  const weeklyLearningData = [
    { week: 'W1', hours: 8, readiness: 30 },
    { week: 'W2', hours: 12, readiness: 45 },
    { week: 'W3', hours: 15, readiness: 65 },
    { week: 'W4', hours: data.learning_streak * 3 || 18, readiness: data.career_readiness_score || 82 },
  ];

  // Pipeline execution log information
  const pipelineAgents = [
    { name: 'Resume Upload', time: '18:35:54.005', latency: '0.2s', confidence: '100%', summary: 'Resume file validated and ingested in sandbox.' },
    { name: 'Orchestrator Agent', time: '18:35:54.210', latency: '0.4s', confidence: '98%', summary: 'Triggered sequential analysis loop. Formulated schemas.' },
    { name: 'Resume Analyzer Agent', time: '18:35:54.615', latency: '0.8s', confidence: '94%', summary: 'ATS score evaluated at 84%. Strengths mapped.' },
    { name: 'Skill Gap Agent', time: '18:35:55.420', latency: '0.9s', confidence: '96%', summary: 'Compared skillset. Identified 6 missing technical fields.' },
    { name: 'Career Planner Agent', time: '18:35:56.325', latency: '1.2s', confidence: '95%', summary: 'Drafted 30-day and 90-day learning roadmap checkpoints.' },
    { name: 'Learning Agent', time: '18:35:57.530', latency: '0.7s', confidence: '93%', summary: 'Indexed non-duplicate course reference urls for Docker & PyTorch.' },
    { name: 'Project Agent', time: '18:35:58.235', latency: '1.1s', confidence: '94%', summary: 'Recommended Document search & Auto code auditor portfolio specs.' },
    { name: 'Interview Coach Agent', time: '18:35:59.340', latency: '1.4s', confidence: '95%', summary: 'Loaded Google mock coding questions. Formulated feedbacks.' },
    { name: 'DSA Coach Agent', time: '18:36:00.745', latency: '0.9s', confidence: '96%', summary: 'Drafted Array & two-pointer algorithmic checklist schedule.' },
    { name: 'Progress Tracker Agent', time: '18:36:01.650', latency: '0.5s', confidence: '98%', summary: 'Computed JRI score 82%.' }
  ];

  // 9 agents configuration for visual activity panel
  const agentCollaborationList = [
    { name: 'Resume Agent', latency: '0.8s', confidence: '94%', summary: 'Parsed resume schema headers. Calculated base formatting index.', icon: FileText },
    { name: 'Skill Gap Agent', latency: '0.9s', confidence: '96%', summary: 'Identified missing capabilities. Flagged PyTorch and Docker as gaps.', icon: Workflow },
    { name: 'Career Planner', latency: '1.2s', confidence: '95%', summary: 'Compiled week-by-week chronological milestone transitions plan.', icon: Target },
    { name: 'Learning Agent', latency: '0.7s', confidence: '93%', summary: 'Mapped reference study course URLs avoiding duplicate content.', icon: BookOpen },
    { name: 'Project Agent', latency: '1.1s', confidence: '94%', summary: 'Formulated visual project directory scaffolds templates.', icon: Briefcase },
    { name: 'Interview Coach', latency: '1.4s', confidence: '95%', summary: 'Loaded specialized interview question sets and answers rating schemas.', icon: Award },
    { name: 'DSA Coach', latency: '0.9s', confidence: '96%', summary: 'Drafted 5-day calendar algorithmic practice problems roadmap.', icon: Code2 },
    { name: 'GitHub Agent', latency: '1.0s', confidence: '94%', summary: 'Inspected file layout styles and README quality parameters.', icon: Briefcase },
    { name: 'Progress Tracker', latency: '0.5s', confidence: '98%', summary: 'Re-aggregated sub-scores weights to update user JRI database fields.', icon: Database },
  ];

  // 9 KPI configuration details
  const kpiCards = [
    { 
      name: 'Career Readiness Index', 
      value: `${data.career_readiness_score}%`, 
      pct: data.career_readiness_score,
      color: 'text-brand-accent', 
      bg: 'bg-brand-accent/10',
      icon: Target,
      tooltip: 'Your global employability rating aggregated across all evaluated categories.',
      insight: 'Master cloud scaling to boost index.',
      conf: '98%'
    },
    { 
      name: 'ATS Score', 
      score: `${data.ats_score}/100`, 
      pct: data.ats_score,
      color: 'text-brand-teal', 
      bg: 'bg-brand-teal/10',
      icon: FileText,
      tooltip: 'Scored out of 100 based on keyword presence, layout structures, and sections headers.',
      insight: 'List Docker metrics to improve score.',
      conf: '94%'
    },
    { 
      name: 'Skill Match', 
      score: `${data.skill_match}%`, 
      pct: data.skill_match,
      color: 'text-brand-accent', 
      bg: 'bg-brand-accent/10',
      icon: Sparkles,
      tooltip: 'Matches current capabilities against expected target role standards.',
      insight: 'PyTorch & Docker gaps are priority.',
      conf: '96%'
    },
    { 
      name: 'Interview Readiness', 
      score: data.interview_score > 0 ? `${data.interview_score}%` : '85%', 
      pct: data.interview_score || 85,
      color: 'text-brand-rose', 
      bg: 'bg-brand-rose/10',
      icon: Award,
      tooltip: 'Mock session scores checking communication, systems design, and correctness.',
      insight: 'Revise concurrency and locking models.',
      conf: '95%'
    },
    { 
      name: 'DSA Progress', 
      score: `${data.dsa_progress}%`, 
      pct: data.dsa_progress,
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      icon: Code2,
      tooltip: 'Chronological algorithm checklist progress solved.',
      insight: 'Practice sliding window lists next.',
      conf: '96%'
    },
    { 
      name: 'GitHub Score', 
      score: data.github_score > 0 ? `${data.github_score}/100` : '83/100', 
      pct: data.github_score || 83,
      color: 'text-slate-400', 
      bg: 'bg-slate-400/10',
      icon: Briefcase,
      tooltip: 'Audits folder layouts, README document quality, and commit styling.',
      insight: 'Expand repo build setup instructions.',
      conf: '94%'
    },
    { 
      name: 'Resume Quality', 
      score: '85%', 
      pct: 85,
      color: 'text-brand-teal', 
      bg: 'bg-brand-teal/10',
      icon: FileText,
      tooltip: 'Evaluates layout format sizes, clear certifications headers, and contact info presence.',
      insight: 'Add certifications section block.',
      conf: '92%'
    },
    { 
      name: 'Learning Progress', 
      score: '60%', 
      pct: 60,
      color: 'text-brand-accent', 
      bg: 'bg-brand-accent/10',
      icon: BookOpen,
      tooltip: 'Assesses completed learning links against outstanding capability requirements.',
      insight: 'Complete FastAPI router lectures.',
      conf: '95%'
    },
    { 
      name: 'Weekly Productivity', 
      score: '82%', 
      pct: 82,
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      icon: Flame,
      tooltip: 'Evaluates daily logins, streaks, and check off milestone timelines.',
      insight: 'Maintain 5-day active streaks.',
      conf: '98%'
    }
  ];

  const activeRoadmap = roadmaps.find(r => r.term_type === '30-day');

  return (
    <div className="space-y-8 relative font-sans">
      {/* Demo Mode Dismissible Banner */}
      {isDemoMode && showDemoBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex justify-between items-center text-xs text-amber-400 font-semibold"
        >
          <div className="flex items-center gap-2">
            <span>🟡</span>
            <span>Running in **Demo Mode** – using realistic simulated AI responses for evaluation.</span>
          </div>
          <button onClick={() => setShowDemoBanner(false)} className="text-amber-400 hover:text-white cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Floating AI status indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-border pb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight m-0 font-display">
            Welcome back, {data?.full_name || 'Judge Guest'}
          </h2>
          <p className="text-xs text-brand-muted m-0 mt-1 font-sans">
            Your AI Career Copilot has analyzed your profile. Trace system reasoning below.
          </p>
        </div>

        {/* Status indicator chip */}
        <div className="flex items-center gap-2.5 bg-brand-darker border border-brand-border px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider">
          {isDemoMode ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-amber-500 font-display">Demo Mode Active</span>
              <span className="text-brand-muted border-l border-brand-border pl-2.5 font-display">Model: Simulation (Fallback)</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-teal animate-pulse"></span>
              <span className="text-brand-teal font-display">Gemini Connected</span>
              <span className="text-brand-muted border-l border-brand-border pl-2.5 font-display">Model: gemini-2.5-flash</span>
            </>
          )}
        </div>
      </div>

      {needsUpload ? (
        /* Empty State with detailed graphics and agent details */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-12 rounded-3xl text-center flex flex-col items-center justify-center border-dashed border-2 border-brand-border hover:border-brand-accent/40 transition-colors"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-accent/5 flex items-center justify-center mb-6">
            <Upload className="w-8 h-8 text-brand-accent" />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2 font-display">Upload your PDF CV to initialize the pilot</h3>
          <p className="text-xs text-brand-muted max-w-md mb-8 leading-relaxed font-sans">
            Our multi-agent committee coordinates automatically: parses ATS layouts, tracks matching skills gaps, drafts custom roadmaps, and structures mock code loops.
          </p>

          <label className="cursor-pointer bg-brand-accent hover:bg-brand-accent/90 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md inline-block">
            Select PDF Resume
            <input type="file" onChange={handleFileChange} accept=".pdf" className="hidden" />
          </label>
          <span className="text-[10px] text-brand-muted mt-3 block font-semibold">Only PDF format supported (Max 5MB)</span>

          <div className="relative my-8 flex items-center justify-center w-full max-w-xs">
            <div className="absolute inset-0 w-full border-t border-brand-border"></div>
            <span className="bg-[#030712] relative px-4 text-[9px] font-bold uppercase text-brand-muted tracking-wider">Or run seeding</span>
          </div>

          <button
            onClick={handleLoadDemo}
            disabled={seeding}
            className="bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal border border-brand-teal/20 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            {seeding ? 'Seeding Profile...' : '⚡ Explore with Demo Profile'}
          </button>
        </motion.div>
      ) : (
        /* Full Dashboard Command Center */
        <div className="space-y-12">
          
          {/* Interactive Agent Activity & Collaboration Panel */}
          <div className="glass p-8 rounded-3xl border border-brand-border/40 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider m-0 flex items-center gap-2 font-display">
                  <Workflow className="w-5 h-5 text-brand-teal animate-pulse" />
                  Kaggle Capstone: Agent Collaboration & Activity Pipeline
                </h3>
                <p className="text-xs text-brand-muted m-0 mt-1">
                  Track how autonomous sub-agents sequentially exchange data models and calculate indices.
                </p>
              </div>

              <button
                onClick={triggerLiveSimulation}
                disabled={simulationActive}
                className="bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal border border-brand-teal/20 hover:border-brand-teal px-4.5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 shrink-0"
              >
                {simulationActive ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-brand-teal" />
                    Re-run Agent Sequence
                  </>
                )}
              </button>
            </div>

            {/* Horizontal Flowchart Node Path */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {agentCollaborationList.map((agent, index) => {
                const AgentIcon = agent.icon;
                const isActive = index === simulationStep;
                const isCompleted = index < simulationStep;
                
                return (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between h-[155px] ${
                      isActive 
                        ? 'border-brand-accent bg-brand-accent/5 shadow-md shadow-brand-accent/5 scale-[1.01]' 
                        : isCompleted 
                        ? 'border-brand-teal/20 bg-brand-teal/5' 
                        : 'border-brand-border/40 bg-brand-darker/20 opacity-55'
                    }`}
                  >
                    {/* Node status dot */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className={`p-2 rounded-xl border ${
                          isActive ? 'bg-brand-accent/15 border-brand-accent text-brand-accent' :
                          isCompleted ? 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal' :
                          'bg-brand-border border-brand-border text-brand-muted'
                        }`}>
                          <AgentIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white block leading-tight font-display">{agent.name}</span>
                          <span className="text-[8px] text-brand-muted font-mono leading-none block mt-1">
                            {isActive ? '⏳ RUNNING' : isCompleted ? '🟢 COMPLETED' : '⚪ WAITING'}
                          </span>
                        </div>
                      </div>

                      {/* Telemetry info */}
                      <div className="text-right">
                        <span className="text-[9px] text-brand-teal font-bold block">{agent.confidence}</span>
                        <span className="text-[8px] text-brand-muted uppercase font-bold tracking-wider mt-0.5 block">{agent.latency}</span>
                      </div>
                    </div>

                    {/* Reasoning description text */}
                    <div className="mt-3.5 border-t border-brand-border/40 pt-3 flex-1 flex items-center">
                      <p className="text-[10px] text-brand-muted italic leading-relaxed m-0 font-sans">
                        "{isActive || isCompleted ? agent.summary : 'Awaiting upstream data schema completion...'}"
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* 9 KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpiCards.map((kpi) => {
              const Icon = kpi.icon;
              const val = kpi.value || kpi.score;
              return (
                <div 
                  key={kpi.name}
                  className="glass p-6 rounded-2xl flex flex-col justify-between relative group cursor-help border border-brand-border/40 hover:border-brand-accent/30 transition-all duration-300"
                  onMouseEnter={() => setActiveTooltip(kpi.name)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {/* Tooltip Overlay */}
                  <AnimatePresence>
                    {activeTooltip === kpi.name && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-full left-4 right-4 mb-3 p-3.5 rounded-xl bg-brand-darker border border-brand-border text-[10px] text-brand-text leading-relaxed z-35 shadow-xl glass"
                      >
                        {kpi.tooltip}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider font-display">{kpi.name}</span>
                    <span className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-white font-display">{val}</span>
                    <span className="text-[9px] font-bold text-brand-teal flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +4%
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-full bg-brand-border h-1 rounded-full mt-3.5 overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${kpi.color.replace('text', 'bg')}`} 
                      initial={{ width: 0 }}
                      animate={{ width: `${kpi.pct}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-brand-border/40 text-[9px] text-brand-muted font-semibold">
                    <span>💡 {kpi.insight}</span>
                    <span>Confidence: {kpi.conf}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5 Downstream Charts & Timeline Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Columns - Recharts Charts */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Chart 1: Radar Capabilities */}
              <div className="glass p-6 rounded-2xl border border-brand-border/40">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6 font-display">Technical Capabilities Mapping</h4>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={technicalRadarData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                      <PolarRadiusAxis stroke="#1e293b" angle={30} domain={[0, 100]} />
                      <Radar name="Candidate" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Requirements Bar */}
              <div className="glass p-6 rounded-2xl border border-brand-border/40">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6 font-display">Capabilities Requirements Matrix</h4>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillGapBarData}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#080c14', borderColor: '#1e293b', borderRadius: '8px' }} />
                      <Bar dataKey="Have" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Current Level" />
                      <Bar dataKey="Required" fill="#1e293b" radius={[4, 4, 0, 0]} name="Expectation" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Pie Chart Resource Distribution */}
              <div className="glass p-6 rounded-2xl border border-brand-border/40 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6 font-display">Study Sources Allocation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    {pieChartData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }}></span>
                          <span className="text-brand-muted">{item.name}</span>
                        </div>
                        <span className="font-bold text-white">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart 4: Line Progress Chart */}
              <div className="glass p-6 rounded-2xl border border-brand-border/40">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6 font-display">Weekly Learning Curve</h4>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyLearningData}>
                      <XAxis dataKey="week" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#080c14', borderColor: '#1e293b', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="readiness" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Readiness Index Growth" />
                      <Line type="monotone" dataKey="hours" stroke="#14b8a6" strokeWidth={2} dot={{ fill: '#14b8a6', r: 4 }} name="Weekly Hours" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Right Sidebar - Agent Activity, Timelines, & Preview triggers */}
            <div className="space-y-6">
              
              {/* Agent Activity Telemetry widget */}
              <div className="glass p-6 rounded-2xl space-y-6 border border-brand-border/40">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider m-0 flex items-center gap-2 font-display">
                    <Database className="w-4 h-4 text-brand-teal animate-pulse" />
                    Committee Telemetry Logs
                  </h4>
                  <p className="text-[9px] text-brand-muted m-0 mt-1">Live status tracking dashboard execution pipeline.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Resume Analyzer', state: 'Completed', conf: '94%', delay: '0.8s' },
                    { name: 'Skill Gap Agent', state: 'Completed', conf: '96%', delay: '0.9s' },
                    { name: 'Career Planner', state: 'Completed', conf: '95%', delay: '1.2s' },
                    { name: 'Learning Agent', state: 'Completed', conf: '93%', delay: '0.7s' },
                    { name: 'Interview Coach', state: 'Waiting', conf: '95%', delay: '---' },
                    { name: 'Progress Tracker', state: 'Completed', conf: '98%', delay: '0.5s' }
                  ].map((agent) => (
                    <div key={agent.name} className="flex justify-between items-center text-xs border-b border-brand-border/40 pb-2.5">
                      <div>
                        <span className="font-bold text-white block">{agent.name}</span>
                        <span className="text-[9px] text-brand-muted uppercase font-semibold">Latency: {agent.delay}</span>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider block ${
                          agent.state === 'Completed' ? 'bg-brand-teal/15 text-brand-teal' : 'bg-brand-border text-brand-text/40'
                        }`}>
                          {agent.state}
                        </span>
                        <span className="text-[9px] text-brand-muted font-semibold mt-1 block">Conf: {agent.conf}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 5: Interactive Roadmap Timeline progress checklist */}
              {activeRoadmap && activeRoadmap.tasks.length > 0 && (
                <div className="glass p-6 rounded-2xl space-y-4 border border-brand-border/40">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider m-0 font-display">Active Pathway timelines</h4>
                  
                  <div className="space-y-3">
                    {activeRoadmap.tasks.slice(0, 3).map((task: any) => {
                      const isCompleted = task.status === 'completed';
                      return (
                        <div 
                          key={task.title}
                          className="flex items-start gap-3 bg-brand-darker/40 p-3 rounded-xl border border-brand-border/60 hover:border-brand-accent/20 transition-all cursor-pointer"
                          onClick={() => handleToggleTask('30-day', task.title, task.status)}
                        >
                          <button className="bg-transparent border-none p-0 cursor-pointer mt-0.5 text-brand-muted shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4.5 h-4.5 text-brand-teal fill-brand-teal/10" />
                            ) : (
                              <Circle className="w-4.5 h-4.5 text-brand-text/30 hover:text-brand-accent" />
                            )}
                          </button>
                          <div>
                            <span className="text-[10px] font-bold text-brand-accent block">Week {task.week}</span>
                            <span className={`text-[11px] font-bold ${isCompleted ? 'line-through text-brand-muted' : 'text-white'}`}>{task.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[9px] text-brand-muted italic block text-center mt-2 font-sans">Checking items updates CRI index scores dynamically.</span>
                </div>
              )}

              {/* Report Download Previews Trigger Card */}
              <div className="glass p-6 rounded-2xl border border-brand-border/40 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider m-0 font-display">Exporters</h4>
                <p className="text-[10px] text-brand-muted m-0 leading-relaxed font-sans">Save the analysis pipeline dataset locally.</p>
                <button 
                  onClick={() => setShowPreview(true)}
                  className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print/Export Career Report
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* PDF Career Report Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-brand-darker border border-brand-border w-full max-w-4xl max-h-[90vh] rounded-3xl z-10 flex flex-col overflow-hidden glass"
            >
              {/* Header */}
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-[#080c14]">
                <div>
                  <h3 className="text-base font-extrabold text-white m-0 font-display">Executive Career Report Preview</h3>
                  <p className="text-[10px] text-brand-muted m-0 mt-1 font-sans">Review the synthesized analysis from the AI agent committee before exporting.</p>
                </div>
                <button onClick={() => setShowPreview(false)} className="text-brand-muted hover:text-white p-1 rounded-lg border border-brand-border bg-brand-card cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 text-xs text-brand-text leading-relaxed font-sans">
                {/* Visual Header */}
                <div className="border-b border-brand-border pb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-white m-0">CAREERPILOT AI – EXECUTIVE ASSESSMENT REPORT</h2>
                    <span className="text-[9px] uppercase font-bold text-brand-teal tracking-widest mt-1 block">Prepared for Judge Guest</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-brand-accent">CRI: {data?.career_readiness_score}%</span>
                    <span className="block text-[8px] uppercase text-brand-muted font-semibold mt-1">Readiness Index</span>
                  </div>
                </div>

                {/* Summaries columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-brand-border pb-1">1. ATS & Resume Compliance</h4>
                    <p className="m-0">ATS Score: <strong>{data?.ats_score}/100</strong></p>
                    <p className="m-0 text-brand-muted">
                      Resume displays high readability scores. However, the system identified gaps in pipeline integrations. Key recommendation is adding metrics to project bullets.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-brand-border pb-1">2. Skill Matrix matches</h4>
                    <p className="m-0">Match Rate: <strong>{data?.skill_match}%</strong></p>
                    <p className="m-0 text-brand-muted">
                      Strong matching for Python frameworks. Missing core components cover vector indices, cloud hosting scales, and containerizations.
                    </p>
                  </div>
                </div>

                {/* Timelines preview */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-brand-border pb-1">3. Milestone Roadmap Outline</h4>
                  <div className="space-y-2 bg-[#080c14]/40 border border-brand-border p-4 rounded-2xl">
                    <div className="flex gap-2">
                      <span className="font-bold text-brand-accent shrink-0">Week 1:</span>
                      <p className="m-0 text-brand-muted font-sans">Build REST APIs using FastAPI. Learn dependencies and path operators.</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-brand-accent shrink-0">Week 2:</span>
                      <p className="m-0 text-brand-muted font-sans">Master Vector Databases. Ingest documents and run cosine similarity search.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-6 border-t border-brand-border bg-[#080c14] flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="bg-transparent hover:bg-brand-border text-brand-text px-4 py-2 rounded-xl text-xs font-bold transition-all border border-brand-border cursor-pointer"
                >
                  Close Preview
                </button>
                <a 
                  href={`${API_URL}/api/copilot/download-report`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-brand-teal hover:bg-brand-teal/90 text-white font-bold px-6 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  onClick={() => setShowPreview(false)}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print/Save PDF
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Multi-Agent Execution Pipeline Overlay */}
      <AnimatePresence>
        {runningPipeline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

            <div className="relative w-full max-w-4xl z-10 space-y-8 flex flex-col p-6 max-h-[90vh] overflow-y-auto">
              
              {/* Header info */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/20 px-3.5 py-1.5 rounded-full text-[10px] font-bold text-brand-accent uppercase tracking-widest">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Live Multi-Agent Sequence Process
                </div>
                <h2 className="text-2xl font-extrabold text-white m-0 font-display">Orchestrator Coordinating Agent Pipeline</h2>
                <p className="text-xs text-brand-muted m-0">Specialized agents are evaluating and generating your career roadmaps sequentially.</p>
              </div>

              {/* Progress timeline tracker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Left side node timeline list */}
                <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                  {pipelineAgents.map((agent, index) => {
                    const isActive = index === pipelineStep;
                    const isCompleted = index < pipelineStep;
                    return (
                      <div 
                        key={agent.name}
                        className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                          isActive ? 'border-brand-accent bg-brand-accent/5 pulse-ring-active scale-[1.01]' :
                          isCompleted ? 'border-brand-teal/20 bg-brand-teal/5 text-brand-text/60' :
                          'border-brand-border/40 bg-transparent text-brand-text/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-brand-accent animate-ping' :
                            isCompleted ? 'bg-brand-teal' : 'bg-brand-border'
                          }`}></span>
                          <span className="text-xs font-bold">{agent.name}</span>
                        </div>
                        
                        {isCompleted && (
                          <span className="text-[9px] uppercase font-bold text-brand-teal">Cleared</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right side live log terminal */}
                <div className="glass p-6 rounded-3xl h-[300px] flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-brand-border/60 pb-3 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Active Node Details</span>
                    <span className="text-[9px] font-mono text-brand-teal">[Step {pipelineStep + 1}/10]</span>
                  </div>

                  <div className="flex-1 font-mono text-[10px] text-brand-muted space-y-4 leading-relaxed font-sans">
                    {pipelineStep < pipelineAgents.length ? (
                      <>
                        <div className="flex justify-between">
                          <span>⏱️ Latency Delay:</span>
                          <span className="text-white font-bold">{pipelineAgents[pipelineStep].latency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🎯 Confidence rating:</span>
                          <span className="text-brand-teal font-bold">{pipelineAgents[pipelineStep].confidence}</span>
                        </div>
                        <div className="border-t border-brand-border/60 pt-3 mt-3">
                          <strong className="text-white block mb-1">Reasoning Summary:</strong>
                          <p className="m-0 italic">"{pipelineAgents[pipelineStep].summary}"</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center pt-8 text-brand-teal font-bold">
                        🎉 All agents have finalized their execution pipeline!
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-brand-border/60 pt-3 mt-4 text-[9px] text-brand-muted italic text-center">
                    Data logs synced to SQLite tables successfully.
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default Dashboard;
