import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  FileText, 
  Camera, 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  Play,
  Users,
  Calendar
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'instructor' | 'admin';
}

interface Exam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  is_active: boolean;
  start_time: string;
  end_time: string;
  instructor_name: string;
}

interface ExamSession {
  id: number;
  exam_id: number;
  student_id: number;
  status: 'in_progress' | 'completed' | 'terminated';
  score: number | null;
  total_violations: number;
  started_at: string;
  submitted_at: string | null;
}

interface StudentDashboardProps {
  user: User;
  onStartExam: (session: ExamSession) => void;
  cameraEnabled: boolean;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  user, 
  onStartExam, 
  cameraEnabled 
}) => {
  const [systemChecks, setSystemChecks] = useState({
    camera: false,
    fullscreen: false,
    browser: false,
  });

  // Real API data
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [examError, setExamError] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    performSystemChecks();
  }, [cameraEnabled]);

  useEffect(() => {
    setLoadingExams(true);
    axios.get('http://localhost:4000/api/exams')
      .then(res => setAvailableExams(res.data))
      .catch(err => setExamError(err.message))
      .finally(() => setLoadingExams(false));
  }, [user.id]);

  // TODO: Replace with your real endpoint for fetching exam sessions for this student
  useEffect(() => {
    setLoadingSessions(true);
    axios.get(`http://localhost:4000/api/exam-sessions?studentId=${user.id}`)
      .then(res => setExamSessions(res.data))
      .catch(err => setSessionError(err.message))
      .finally(() => setLoadingSessions(false));
  }, [user.id]);

  const performSystemChecks = async () => {
    const checks = {
      camera: cameraEnabled,
      fullscreen: document.fullscreenEnabled,
      browser: !!/Chrome/.test(navigator.userAgent) || !!/Firefox/.test(navigator.userAgent),
    };
    setSystemChecks(checks);
    console.log('System checks completed:', checks);
  };

  const handleStartExam = async (exam: Exam) => {
    if (!systemChecks.camera || !systemChecks.fullscreen) {
      alert('Please ensure camera access and fullscreen capability before starting the exam.');
      return;
    }
    // TODO: Replace with real API call to create a new exam session
    const session: ExamSession = {
      id: Date.now(), // In real app, this would come from API
      exam_id: exam.id,
      student_id: user.id,
      status: 'in_progress',
      score: null,
      total_violations: 0,
      started_at: new Date().toISOString(),
      submitted_at: null,
    };
    // Optionally, POST to backend to create session, then call onStartExam with response
    onStartExam(session);
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);
    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'expired';
    return 'active';
  };

  const getSessionBadge = (session: ExamSession) => {
    switch (session.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'terminated':
        return <Badge variant="destructive">Terminated</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Welcome, {user.full_name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Access your available exams and track your progress. Make sure to complete the system 
            checks before starting any exam.
          </p>
        </CardContent>
      </Card>

      {/* System Requirements Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>System Requirements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              {systemChecks.camera ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">Camera Access</p>
                <p className="text-sm text-gray-600">
                  {systemChecks.camera ? 'Ready' : 'Required for exam monitoring'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {systemChecks.fullscreen ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">Fullscreen Mode</p>
                <p className="text-sm text-gray-600">
                  {systemChecks.fullscreen ? 'Supported' : 'Required during exam'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {systemChecks.browser ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              )}
              <div>
                <p className="font-medium">Browser Support</p>
                <p className="text-sm text-gray-600">
                  {systemChecks.browser ? 'Compatible' : 'Use Chrome/Firefox for best experience'}
                </p>
              </div>
            </div>
          </div>

          {(!systemChecks.camera || !systemChecks.fullscreen) && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                Please ensure all system requirements are met before starting an exam. 
                Camera access and fullscreen support are mandatory for exam integrity.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Available Exams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Available Exams</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingExams ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading available exams...</p>
            </div>
          ) : examError ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Failed to load exams. Please refresh the page.
              </AlertDescription>
            </Alert>
          ) : availableExams.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No exams available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableExams.map((exam) => {
                const status = getExamStatus(exam);
                const canStart = status === 'active' && exam.is_active;
                
                return (
                  <div key={exam.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{exam.title}</h3>
                        <p className="text-gray-600 text-sm">{exam.description}</p>
                      </div>
                      <Badge 
                        variant={status === 'active' ? 'default' : status === 'upcoming' ? 'secondary' : 'destructive'}
                      >
                        {status === 'active' ? 'Available' : status === 'upcoming' ? 'Upcoming' : 'Expired'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{exam.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>{exam.total_questions} questions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-500" />
                        <span>{exam.passing_score}% to pass</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Ends: {new Date(exam.end_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleStartExam(exam)}
                      disabled={!canStart || !systemChecks.camera || !systemChecks.fullscreen}
                      className="w-full md:w-auto"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {canStart ? 'Start Exam' : 'Not Available'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exam History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Exam History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading exam history...</p>
            </div>
          ) : examSessions.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No exam history available.</p>
          ) : (
            <div className="space-y-3">
              {examSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Exam Session #{session.id}</p>
                      <p className="text-sm text-gray-600">
                        Started: {new Date(session.started_at).toLocaleString()}
                      </p>
                      {session.submitted_at && (
                        <p className="text-sm text-gray-600">
                          Completed: {new Date(session.submitted_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {getSessionBadge(session)}
                      {session.score !== null && (
                        <p className="text-lg font-bold mt-1">{session.score}%</p>
                      )}
                      {session.total_violations > 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          {session.total_violations} violations
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
