import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Header from './components/layout/Header';
import VoiceFAB from './components/layout/VoiceFAB';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Equipment from './pages/Equipment';
import Workers from './pages/Workers';
import Schemes from './pages/Schemes';
import Profile from './pages/Profile';
import Assistant from './pages/Assistant';
import Login from './pages/Login';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/equipment" element={
              <ProtectedRoute>
                <Equipment />
              </ProtectedRoute>
            } />
            <Route path="/workers" element={
              <ProtectedRoute>
                <Workers />
              </ProtectedRoute>
            } />
            <Route path="/schemes" element={
              <ProtectedRoute>
                <Schemes />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/assistant" element={
              <ProtectedRoute>
                <Assistant />
              </ProtectedRoute>
            } />
          </Routes>
          <VoiceFAB />
          <Navbar />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
