import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  MessageSquareCode, 
  Code2, 
  BookOpenCheck, 
  Cpu, 
  LogOut,
  Target,
  FileDown,
  Sparkles,
  Menu,
  X,
  FileText
} from 'lucide-react';

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

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { name: 'Career Roadmap', path: '/roadmap', icon: Map },
    { name: 'Interview Coach', path: '/interview', icon: MessageSquareCode },
    { name: 'DSA Coach', path: '/dsa', icon: Code2 },
    { name: 'GitHub Auditor', path: '/github', icon: GithubIcon },
    { name: 'Learning & Projects', path: '/learning', icon: BookOpenCheck },
    { name: 'System Architecture', path: '/architecture', icon: Cpu },
  ];

  const handleDownloadReport = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/copilot/download-report', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Report download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'careerpilot_report.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Complete the resume upload first to generate a report.');
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#080c14] md:bg-transparent">
      {/* Brand Header */}
      <div className="p-6 border-b border-brand-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-accent to-brand-teal flex items-center justify-center pulse-ring-active shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-white m-0 leading-none font-display">CareerPilot</h1>
          <span className="text-[9px] text-brand-teal uppercase font-extrabold tracking-widest block mt-1">AI Copilot</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/20 border border-brand-accent' 
                  : 'text-brand-text/60 hover:text-white hover:bg-brand-border/30 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-brand-border space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-extrabold text-brand-accent border border-brand-border text-sm shrink-0">
            {user?.full_name ? user.full_name[0] : 'U'}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate m-0 leading-snug">{user?.full_name || 'Demo User'}</p>
            <p className="text-[9px] text-brand-muted truncate m-0 leading-none">{user?.email || 'demo@careerpilot.ai'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            onLogout();
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold text-red-400/90 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/10 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-brand-dark text-brand-text font-sans">
      {/* Sidebar for Desktop */}
      <aside className="w-60 glass border-r border-brand-border hidden md:flex flex-col shrink-0 z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer Content */}
            <div className="relative w-64 h-full border-r border-brand-border flex flex-col z-10 glass">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-brand-muted hover:text-white p-1 rounded-lg border border-brand-border bg-brand-darker"
              >
                <X className="w-4 h-4" />
              </button>
              {navContent}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 glass border-b border-brand-border flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg border border-brand-border text-brand-text/80 hover:text-white md:hidden hover:bg-brand-border/30 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 bg-brand-darker px-2.5 py-1.5 rounded-lg border border-brand-border">
              <Target className="w-3.5 h-3.5 text-brand-teal" />
              <span className="text-[10px] font-extrabold text-brand-muted uppercase">Target:</span>
              <span className="text-[11px] font-bold text-white leading-none">{user?.target_role || 'AI Engineer'}</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-4 text-xs text-brand-muted font-semibold">
              <span>⚡ Pacing: <strong className="text-white font-bold">{user?.learning_speed || 'Moderate'}</strong></span>
              <span>📅 Available: <strong className="text-white font-bold">{user?.available_hours || 15} hrs/wk</strong></span>
            </div>
          </div>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-brand-border hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-[11px] font-extrabold tracking-wide transition-all border border-slate-700 shadow-sm cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-brand-teal" />
            Download Career Report
          </button>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-brand-darker/20">
          {children}
        </main>
      </div>
    </div>
  );
};

// Help types to bypass import errors
const AnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

export default Layout;
