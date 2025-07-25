import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import CreateExamDialog from './CreateExamDialog';
import ExamMonitoring from './ExamMonitoring';
import ExamResults from './ExamResults';

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
  active_sessions: number;
  completed_sessions: number;
}

interface InstructorDashboardProps {
  user: User;
}

const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ user }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Real API data
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [examError, setExamError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingExams(true);
    axios.get('http://localhost:4000/api/exams')
      .then(res => setExams(res.data))
      .catch(err => setExamError(err.message))
      .finally(() => setLoadingExams(false));
  }, [user.id]);

  const handleCreateExam = () => {
    setShowCreateDialog(true);
  };

  const handleExamCreated = () => {
    setShowCreateDialog(false);
    // Optionally, re-fetch exams
    setLoadingExams(true);
    axios.get('http://localhost:4000/api/exams')
      .then(res => setExams(res.data))
      .catch(err => setExamError(err.message))
      .finally(() => setLoadingExams(false));
  };

  const getExamStatusBadge = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);
    if (!exam.is_active) return <Badge variant="secondary">Draft</Badge>;
    if (now < startTime) return <Badge variant="outline">Scheduled</Badge>;
    if (now > endTime) return <Badge variant="destructive">Expired</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.reduce((sum, exam) => sum + (exam.active_sessions || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Students currently taking exams
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.reduce((sum, exam) => sum + (exam.completed_sessions || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total completed sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Total integrity violations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="exams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exams">My Exams</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="results">Results & Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Exams</h3>
            <Button onClick={handleCreateExam}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Exam
            </Button>
          </div>
          
          <div className="grid gap-4">
            {loadingExams ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600">Loading exams...</p>
                </CardContent>
              </Card>
            ) : exams.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No exams created yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first exam to get started with online assessments.
                  </p>
                  <Button onClick={handleCreateExam}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Exam
                  </Button>
                </CardContent>
              </Card>
            ) : (
              exams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{exam.title}</span>
                          {getExamStatusBadge(exam)}
                        </CardTitle>
                        <p className="text-gray-600 mt-1">{exam.description}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedExam(exam)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Monitor
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-gray-600">{exam.duration_minutes} min</p>
                      </div>
                      <div>
                        <p className="font-medium">Questions</p>
                        <p className="text-gray-600">{exam.total_questions}</p>
                      </div>
                      <div>
                        <p className="font-medium">Passing Score</p>
                        <p className="text-gray-600">{exam.passing_score}%</p>
                      </div>
                      <div>
                        <p className="font-medium">Active</p>
                        <p className="text-gray-600">{exam.active_sessions || 0}</p>
                      </div>
                      <div>
                        <p className="font-medium">Completed</p>
                        <p className="text-gray-600">{exam.completed_sessions || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="monitoring">
          <ExamMonitoring exams={exams} user={user} />
        </TabsContent>
        
        <TabsContent value="results">
          <ExamResults exams={exams} user={user} />
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Platform Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Anti-Cheat Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Face Detection Sensitivity</span>
                      <Badge variant="outline">High</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tab Switch Detection</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Violation Threshold</span>
                      <Badge variant="outline">3 warnings</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Notification Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Real-time Violation Alerts</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Exam Completion Notifications</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Exam Dialog */}
      {showCreateDialog && (
        <CreateExamDialog 
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onExamCreated={handleExamCreated}
          instructorId={user.id}
        />
      )}
    </div>
  );
};

export default InstructorDashboard;
