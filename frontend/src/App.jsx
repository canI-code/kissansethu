import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Header from './components/layout/Header';
import VoiceFAB from './components/layout/VoiceFAB';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Equipment from './pages/Equipment';
import Workers from './pages/Workers';
import Schemes from './pages/Schemes';
import Profile from './pages/Profile';
import Assistant from './pages/Assistant';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WorkerDashboard from './pages/WorkerDashboard';

/**
 * RoleProtectedRoute — wraps ProtectedRoute and additionally checks activeRole.
 * Redirects to home if the user doesn't have the required role active.
 */
function RoleProtectedRoute({ children, requiredRole }) {
  const { activeRole } = useAuth();
  if (activeRole && activeRole !== requiredRole) {
    return <Navigate to="/home" replace />;
  }
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

/**
 * SmartHome — redirects logged-in users from landing to /home
 */
function SmartHome() {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return <Navigate to="/home" replace />;
  return <Landing />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<SmartHome />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected app routes — all under /home, /equipment, etc. */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
            <Route path="/workers" element={<ProtectedRoute><Workers /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />

            {/* Worker-only route */}
            <Route
              path="/worker-dashboard"
              element={
                <RoleProtectedRoute requiredRole="worker">
                  <WorkerDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <VoiceFAB />
          <Navbar />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
