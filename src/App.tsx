import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import QuantumIntelligence from '@/pages/QuantumIntelligence';
import AIDecisionEngine from '@/pages/AIDecisionEngine';
import OptimizationIntelligence from '@/pages/OptimizationIntelligence';
import ThreatDetection from '@/pages/ThreatDetection';
import DeepfakeDetection from '@/pages/DeepfakeDetection';
import FactChain from '@/pages/FactChain';
import EcoScanner from '@/pages/EcoScanner';
import AIChatbot from '@/pages/AIChatbot';
import DataAnalytics from '@/pages/DataAnalytics';
import AIReports from '@/pages/AIReports';
import Settings from '@/pages/Settings';
import DatasetLab from '@/pages/DatasetLab';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center animate-pulse">
        <span className="text-white text-sm font-bold">S</span>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/quantum" element={<ProtectedRoute><AppLayout><QuantumIntelligence /></AppLayout></ProtectedRoute>} />
      <Route path="/ai-engine" element={<ProtectedRoute><AppLayout><AIDecisionEngine /></AppLayout></ProtectedRoute>} />
      <Route path="/optimization" element={<ProtectedRoute><AppLayout><OptimizationIntelligence /></AppLayout></ProtectedRoute>} />
      <Route path="/threat" element={<ProtectedRoute><AppLayout><ThreatDetection /></AppLayout></ProtectedRoute>} />
      <Route path="/deepfake" element={<ProtectedRoute><AppLayout><DeepfakeDetection /></AppLayout></ProtectedRoute>} />
      <Route path="/factchain" element={<ProtectedRoute><AppLayout><FactChain /></AppLayout></ProtectedRoute>} />
      <Route path="/eco-scanner" element={<ProtectedRoute><AppLayout><EcoScanner /></AppLayout></ProtectedRoute>} />
      <Route path="/chatbot" element={<ProtectedRoute><AppLayout><AIChatbot /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AppLayout><DataAnalytics /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppLayout><AIReports /></AppLayout></ProtectedRoute>} />
      <Route path="/settings"     element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="/dataset-lab" element={<ProtectedRoute><AppLayout><DatasetLab /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <BrowserRouter>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease' }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </div>
    </BrowserRouter>
  );
}
