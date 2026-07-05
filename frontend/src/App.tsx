import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './services/api';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Roadmap from './components/Roadmap';
import InterviewCoach from './components/InterviewCoach';
import DSACoach from './components/DSACoach';
import GitHubReview from './components/GitHubReview';
import LearningHub from './components/LearningHub';
import ArchDiagram from './components/ArchDiagram';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import { Loader2 } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      if (api.isAuthenticated()) {
        const userData = await api.get<any>('/api/auth/me');
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err);
      api.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
        <span className="text-xs font-semibold text-brand-muted">Initializing CareerPilot AI...</span>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Unauthenticated Route */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={setUser} />} 
        />

        {/* Authenticated Dashboard Routes */}
        <Route 
          path="/*" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard onRefreshUser={fetchUser} />} />
                  <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                  <Route path="/roadmap" element={<Roadmap />} />
                  <Route path="/interview" element={<InterviewCoach />} />
                  <Route path="/dsa" element={<DSACoach />} />
                  <Route path="/github" element={<GitHubReview />} />
                  <Route path="/learning" element={<LearningHub />} />
                  <Route path="/architecture" element={<ArchDiagram />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
