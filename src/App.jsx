import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/pages/LandingPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { ComplaintList } from './components/complaints/ComplaintList';
import { ComplaintSubmissionPage } from './components/student/ComplaintSubmissionPage';
import { ComplaintDetailPage } from './components/complaints/ComplaintDetailPage';
import { ComplaintTriagePage } from './components/admin/ComplaintTriagePage';
import { DepartmentsView } from './components/admin/DepartmentsView';
import { AnalyticsView } from './components/admin/AnalyticsView';
import { StudentLoginPage } from './components/student/StudentLoginPage';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { IntelligenceDashboardPage } from './components/intelligence/IntelligenceDashboardPage';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Shared modals & toasts
import { ExportModal } from './components/shared/ExportModal';
import { ComplaintSubmissionModal } from './components/student/ComplaintSubmissionModal';
import { ComplaintDetailModal } from './components/complaints/ComplaintDetailModal';
import { ComplaintTriageModal } from './components/admin/ComplaintTriageModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Restore route if redirected from 404.html on Netlify
  React.useEffect(() => {
    const redirectPath = sessionStorage.getItem('spa_redirect');
    if (redirectPath && redirectPath !== '/' && redirectPath !== '/index.html') {
      sessionStorage.removeItem('spa_redirect');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  const isLandingRoute = location.pathname === '/welcome' || location.pathname === '/home';

  const isAuthRoute = [
    '/login',
    '/register',
    '/student/login',
    '/student/register',
    '/admin/login',
    '/admin'
  ].includes(location.pathname);

  if (isLandingRoute) {
    return (
      <div className="landing-layout">
        <LandingPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className={`app-container ${isAuthRoute ? 'auth-mode' : ''}`}>
      {/* Ambient background glow orbs */}
      <div className="ambient-glow">
        <div className="glow-orb glow-orb-1" style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)' }} />
        <div className="glow-orb glow-orb-2" style={{ background: 'radial-gradient(circle, rgba(244, 114, 182, 0.12) 0%, transparent 70%)' }} />
      </div>

      {/* Sidebar navigation - only rendered on internal pages */}
      {!isAuthRoute && (
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className={`app-main ${isAuthRoute ? 'auth-main-view' : ''}`}>
        {!isAuthRoute && (
          <Header onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        )}
        
        <main
          className={`app-content ${isAuthRoute ? 'auth-content-view' : ''}`}
          style={isAuthRoute ? { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px 16px' } : {}}
        >
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<StudentLoginPage defaultTab="login" />} />
            <Route path="/register" element={<StudentLoginPage defaultTab="register" />} />
            <Route path="/student/login" element={<StudentLoginPage defaultTab="login" />} />
            <Route path="/student/register" element={<StudentLoginPage defaultTab="register" />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />

            {/* Authenticated Routes */}
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><ComplaintList /></ProtectedRoute>} />
            <Route path="/complaints/my" element={<ProtectedRoute><ComplaintList customTitle="My Reported Complaints" onlyMyComplaints={true} /></ProtectedRoute>} />
            <Route path="/complaints/new" element={<ProtectedRoute><ComplaintSubmissionPage /></ProtectedRoute>} />
            <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute><DepartmentsView /></ProtectedRoute>} />

            {/* Admin & Staff Only Restricted Routes */}
            <Route path="/admin/triage/:id" element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <ComplaintTriagePage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <AnalyticsView />
              </ProtectedRoute>
            } />
            <Route path="/admin/intelligence" element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <IntelligenceDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/intelligence" element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <IntelligenceDashboardPage />
              </ProtectedRoute>
            } />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Modals & Toasts */}
      {!isAuthRoute && (
        <>
          <ExportModal />
          <ComplaintSubmissionModal />
          <ComplaintDetailModal />
          <ComplaintTriageModal />
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <MainLayout />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
