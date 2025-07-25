import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  AlertTriangle, 
  Eye, 
  Camera, 
  Monitor,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
// Remove useLoadAction import and loadExamMonitoringAction import

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'instructor' | 'admin';
}

interface Exam {
  id: number;
  title: string;
  is_active: boolean;
  active_sessions: number;
}

interface SessionMonitoring {
  id: number;
  student_name: string;
  student_email: string;
  exam_title: string;
  started_at: string;
  time_remaining: number;
  violation_count: number;
  last_violation: string;
  current_question: number;
  total_questions: number;
  status: 'active' | 'completed' | 'suspended';
  camera_status: 'active' | 'inactive' | 'blocked';
  fullscreen_status: 'active' | 'inactive';
}

interface ExamMonitoringProps {
  exams: Exam[];
  user: User;
}

const ExamMonitoring: React.FC<ExamMonitoringProps> = ({ exams, user }) => {
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Real API data
  const [sessions, setSessions] = useState<SessionMonitoring[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedExam) return;
    setLoadingSessions(true);
    axios.get(`http://localhost:4000/api/monitoring-sessions?examId=${selectedExam}`)
      .then(res => setSessions(res.data))
      .catch(err => setSessionError(err.message))
      .finally(() => setLoadingSessions(false));
  }, [selectedExam]);

  const refreshSessions = () => {
    if (!selectedExam) return;
    setLoadingSessions(true);
    axios
      .get(`http://localhost:4000/api/monitoring-sessions?examId=${selectedExam}`)
      .then((res) => setSessions(res.data))
      .catch((err) => setSessionError(err.message))
      .finally(() => setLoadingSessions(false));
  };
  

  // Auto refresh every 5 seconds
  useEffect(() => {
    if (autoRefresh && selectedExam) {
      const interval = setInterval(() => {
        refreshSessions();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedExam]);
  

  const activeExams = exams.filter(exam => exam.is_active && exam.active_sessions > 0);

  const getViolationBadge = (count: number) => {
    if (count === 0) return <Badge variant="default">Clean</Badge>;
    if (count <= 2) return <Badge variant="outline">Warning</Badge>;
    return <Badge variant="destructive">Critical</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatTimeRemaining = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Active Exams Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeExams.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeExams.reduce((sum, exam) => sum + exam.active_sessions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Taking exams now
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.reduce((sum, session) => sum + session.violation_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total violations today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Exam to Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          {activeExams.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No active exams with students currently taking them.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeExams.map((exam) => (
                <Card 
                  key={exam.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedExam === exam.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedExam(exam.id)}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{exam.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {exam.active_sessions} active student{exam.active_sessions !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Monitoring Dashboard */}
      {selectedExam && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Live Monitoring</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
                </Button>
                <Button variant="outline" size="sm" onClick={refreshSessions}>
                  Refresh Now
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading monitoring data...</p>
              </div>
            ) : sessions.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No active sessions found for this exam.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Student Info */}
                        <div>
                          <h4 className="font-semibold">{session.student_name}</h4>
                          <p className="text-sm text-gray-600">{session.student_email}</p>
                          <div className="mt-2">
                            {getStatusBadge(session.status)}
                          </div>
                        </div>
                        
                        {/* Progress Info */}
                        <div>
                          <p className="text-sm font-medium">Progress</p>
                          <p className="text-sm text-gray-600">
                            Question {session.current_question} of {session.total_questions}
                          </p>
                          <div className="flex items-center mt-2 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{formatTimeRemaining(session.time_remaining)} left</span>
                          </div>
                        </div>
                        
                        {/* Monitoring Status */}
                        <div>
                          <p className="text-sm font-medium">Monitoring</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center">
                              <Camera className="h-3 w-3 mr-1" />
                              <span className={session.camera_status === 'active' ? 'text-green-600' : 'text-red-600'}>
                                Camera {session.camera_status}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Monitor className="h-3 w-3 mr-1" />
                              <span className={session.fullscreen_status === 'active' ? 'text-green-600' : 'text-red-600'}>
                                Fullscreen {session.fullscreen_status}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Violations */}
                        <div>
                          <p className="text-sm font-medium">Integrity</p>
                          <div className="mt-1">
                            {getViolationBadge(session.violation_count)}
                          </div>
                          {session.violation_count > 0 && (
                            <p className="text-xs text-red-600 mt-1">
                              Last: {session.last_violation}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      {session.violation_count >= 3 && session.status === 'active' && (
                        <div className="mt-4 pt-4 border-t">
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Student has exceeded violation threshold. Consider taking action.
                            </AlertDescription>
                          </Alert>
                          <div className="mt-2 flex space-x-2">
                            <Button variant="outline" size="sm">
                              Send Warning
                            </Button>
                            <Button variant="destructive" size="sm">
                              Suspend Session
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamMonitoring;
