import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Download, 
  Users, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  FileText
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
  total_questions: number;
  passing_score: number;
}

interface ExamResult {
  id: number;
  student_name: string;
  student_email: string;
  final_score: number;
  status: 'completed' | 'failed' | 'suspended';
  started_at: string;
  completed_at: string;
  time_taken_minutes: number;
  violation_count: number;
  total_violations: string[];
}

interface ExamResultsProps {
  exams: Exam[];
  user: User;
}

const ExamResults: React.FC<ExamResultsProps> = ({ exams, user }) => {
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  
  // Mock data - in real app, this would come from useLoadAction
  const mockResults: ExamResult[] = [
    {
      id: 1,
      student_name: "John Doe",
      student_email: "john@example.com",
      final_score: 85,
      status: "completed",
      started_at: "2024-01-15T10:00:00Z",
      completed_at: "2024-01-15T11:30:00Z",
      time_taken_minutes: 90,
      violation_count: 1,
      total_violations: ["Face not detected for 10 seconds"]
    },
    {
      id: 2,
      student_name: "Jane Smith",
      student_email: "jane@example.com",
      final_score: 92,
      status: "completed",
      started_at: "2024-01-15T10:00:00Z",
      completed_at: "2024-01-15T11:45:00Z",
      time_taken_minutes: 105,
      violation_count: 0,
      total_violations: []
    },
    {
      id: 3,
      student_name: "Bob Wilson",
      student_email: "bob@example.com",
      final_score: 45,
      status: "failed",
      started_at: "2024-01-15T10:00:00Z",
      completed_at: "2024-01-15T11:20:00Z",
      time_taken_minutes: 80,
      violation_count: 2,
      total_violations: ["Tab switch detected", "Window blur detected"]
    }
  ];

  const selectedExamData = exams.find(exam => exam.id === selectedExam);
  const results = selectedExam ? mockResults : [];
  
  const passedStudents = results.filter(r => r.final_score >= (selectedExamData?.passing_score || 70));
  const failedStudents = results.filter(r => r.final_score < (selectedExamData?.passing_score || 70));
  const averageScore = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.final_score, 0) / results.length) : 0;
  const totalViolations = results.reduce((sum, r) => sum + r.violation_count, 0);

  const getStatusBadge = (status: string, score: number, passingScore: number) => {
    if (status === 'suspended') return <Badge variant="destructive">Suspended</Badge>;
    if (score >= passingScore) return <Badge variant="default">Passed</Badge>;
    return <Badge variant="secondary">Failed</Badge>;
  };

  const exportResults = () => {
    if (!selectedExamData || results.length === 0) return;
    
    const csvContent = [
      'Student Name,Email,Score,Status,Started At,Completed At,Time Taken (min),Violations,Violation Details',
      ...results.map(result => [
        result.student_name,
        result.student_email,
        result.final_score,
        result.status,
        result.started_at,
        result.completed_at,
        result.time_taken_minutes,
        result.violation_count,
        result.total_violations.join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedExamData.title}_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Exam for Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
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
                    {exam.total_questions} questions • {exam.passing_score}% to pass
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedExam && selectedExamData && (
        <>
          {/* Results Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.length}</div>
                <p className="text-xs text-muted-foreground">
                  Completed the exam
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  Class average
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {results.length > 0 ? Math.round((passedStudents.length / results.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {passedStudents.length} of {results.length} passed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Violations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalViolations}</div>
                <p className="text-xs text-muted-foreground">
                  Total integrity violations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{selectedExamData.title} - Detailed Results</CardTitle>
                <Button onClick={exportResults} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">All Students ({results.length})</TabsTrigger>
                  <TabsTrigger value="passed">Passed ({passedStudents.length})</TabsTrigger>
                  <TabsTrigger value="failed">Failed ({failedStudents.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <ResultsTable results={results} passingScore={selectedExamData.passing_score} />
                </TabsContent>
                
                <TabsContent value="passed">
                  <ResultsTable results={passedStudents} passingScore={selectedExamData.passing_score} />
                </TabsContent>
                
                <TabsContent value="failed">
                  <ResultsTable results={failedStudents} passingScore={selectedExamData.passing_score} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

interface ResultsTableProps {
  results: ExamResult[];
  passingScore: number;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, passingScore }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No results found in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card key={result.id}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div>
                <h4 className="font-semibold">{result.student_name}</h4>
                <p className="text-sm text-gray-600">{result.student_email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Score</p>
                <p className="text-2xl font-bold">{result.final_score}%</p>
                {(() => {
                  if (result.status === 'suspended') return <Badge variant="destructive">Suspended</Badge>;
                  if (result.final_score >= passingScore) return <Badge variant="default">Passed</Badge>;
                  return <Badge variant="secondary">Failed</Badge>;
                })()}
              </div>
              
              <div>
                <p className="text-sm font-medium">Time Taken</p>
                <p className="text-sm text-gray-600">
                  {Math.floor(result.time_taken_minutes / 60)}h {result.time_taken_minutes % 60}m
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(result.completed_at).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Violations</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${result.violation_count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {result.violation_count}
                  </span>
                  {result.violation_count > 0 ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Actions</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {result.violation_count > 0 && (
                    <Button variant="outline" size="sm">
                      View Violations
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {result.total_violations.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-red-600 mb-2">Violation Details:</p>
                <div className="space-y-1">
                  {result.total_violations.map((violation, index) => (
                    <p key={index} className="text-xs text-red-600">• {violation}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExamResults;
