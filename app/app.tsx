import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import ExamInterface from './components/ExamInterface';
import AntiCheatMonitor from './components/AntiCheatMonitor';
import { Toaster } from '@/components/ui/toaster';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'instructor' | 'admin';
}

interface ExamSession {
  id: number;
  exam_id: number;
  student_id: number;
  status: 'in_progress' | 'completed' | 'terminated';
  total_violations: number;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeExamSession, setActiveExamSession] = useState<ExamSession | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
    } catch (error) {
      setCameraPermission('denied');
      console.error('Camera permission denied:', error);
    }
  };

  // Navigation helpers
  const AuthRoutes = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect after login
    useEffect(() => {
      if (currentUser) {
        if (currentUser.role === 'student') {
          navigate('/student');
        } else if (currentUser.role === 'instructor' || currentUser.role === 'admin') {
          navigate('/instructor');
        }
      }
    }, [currentUser, navigate]);

    // Redirect to login if not logged in
    useEffect(() => {
      if (!currentUser && location.pathname !== '/') {
        navigate('/');
      }
    }, [currentUser, location, navigate]);

    return null;
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveExamSession(null);
    // Navigation handled by AuthRoutes
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveExamSession(null);
  };

  const startExamSession = (examSession: ExamSession) => {
    setActiveExamSession(examSession);
    // Request fullscreen mode for exam
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const endExamSession = () => {
    setActiveExamSession(null);
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <BrowserRouter>
      <AuthRoutes />
      <Routes>
        <Route
          path="/"
          element={
            !currentUser ? (
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-blue-600 rounded-full">
                        {/* You can use your Shield icon here */}
                        <span role="img" aria-label="shield">🛡️</span>
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">SecureExam</h1>
                    <p className="text-gray-600">AI-Powered Online Examination Platform</p>
                  </div>
                  <Login onLogin={handleLogin} />
                </div>
              </div>
            ) : (
              <Navigate to={`/${currentUser.role}`} replace />
            )
          }
        />
        <Route
          path="/student"
          element={
            currentUser && currentUser.role === 'student' ? (
              activeExamSession ? (
                <div className="min-h-screen bg-gray-900">
                  <AntiCheatMonitor
                    sessionId={activeExamSession.id}
                    onViolation={(violation) => console.log('Violation detected:', violation)}
                  />
                  <ExamInterface
                    session={activeExamSession}
                    onComplete={endExamSession}
                  />
                </div>
              ) : (
                <StudentDashboard
                  user={currentUser}
                  onStartExam={startExamSession}
                  cameraEnabled={cameraPermission === 'granted'}
                />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/instructor"
          element={
            currentUser && (currentUser.role === 'instructor' || currentUser.role === 'admin') ? (
              <InstructorDashboard user={currentUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        {/* Add more routes as needed */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
