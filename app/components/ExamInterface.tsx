import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  AlertTriangle,
  CheckCircle,
  Send
} from 'lucide-react';
import { useLoadAction, useMutateAction } from '@uibakery/data';
import loadExamQuestionsAction from '../actions/loadExamQuestions';
import submitAnswerAction from '../actions/submitAnswer';
import submitExamAction from '../actions/submitExam';

interface ExamSession {
  id: number;
  exam_id: number;
  student_id: number;
  status: 'in_progress' | 'completed' | 'terminated';
  total_violations: number;
}

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  points: number;
}

interface Answer {
  questionId: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  flagged: boolean;
}

interface ExamInterfaceProps {
  session: ExamSession;
  onComplete: () => void;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({ session, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(5400); // 90 minutes in seconds
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Load exam questions
  const [questions, loadingQuestions, questionError] = useLoadAction<Question>(
    loadExamQuestionsAction,
    [],
    { examId: session.exam_id }
  );

  // Submit answer mutation
  const [submitAnswer, submittingAnswer] = useMutateAction(submitAnswerAction);
  
  // Submit exam mutation
  const [submitExam, submittingExam] = useMutateAction(submitExamAction);

  // Initialize answers array when questions load
  useEffect(() => {
    if (questions.length > 0) {
      setAnswers(questions.map(q => ({
        questionId: q.id,
        selectedAnswer: null,
        flagged: false
      })));
    }
  }, [questions]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = async (questionId: number, answer: 'A' | 'B' | 'C' | 'D') => {
    const newAnswers = answers.map(a => 
      a.questionId === questionId 
        ? { ...a, selectedAnswer: answer }
        : a
    );
    setAnswers(newAnswers);

    // Submit answer to backend
    try {
      await submitAnswer({
        sessionId: session.id,
        questionId,
        selectedAnswer: answer
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleFlagQuestion = (questionId: number) => {
    const newAnswers = answers.map(a => 
      a.questionId === questionId 
        ? { ...a, flagged: !a.flagged }
        : a
    );
    setAnswers(newAnswers);
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitExam = async () => {
    try {
      await submitExam({
        sessionId: session.id,
        completedAt: new Date().toISOString()
      });
      onComplete();
    } catch (error) {
      console.error('Failed to submit exam:', error);
    }
  };

  const handleAutoSubmit = async () => {
    console.log('Time expired - auto submitting exam');
    await handleSubmitExam();
  };

  const getAnsweredCount = () => {
    return answers.filter(a => a.selectedAnswer !== null).length;
  };

  const getFlaggedCount = () => {
    return answers.filter(a => a.flagged).length;
  };

  const getProgressPercentage = () => {
    return (getAnsweredCount() / questions.length) * 100;
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading exam questions...</p>
        </div>
      </div>
    );
  }

  if (questionError || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-white">Exam Loading Error</h2>
            <p className="text-gray-400 mb-4">
              Unable to load exam questions. Please contact your instructor.
            </p>
            <Button onClick={onComplete} variant="outline">
              Exit Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Exam Session #{session.id}</h1>
            <p className="text-gray-400 text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Progress */}
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">
                {getAnsweredCount()}/{questions.length} answered
              </span>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-2">
              <Clock className={`h-5 w-5 ${timeRemaining < 600 ? 'text-red-500' : 'text-blue-500'}`} />
              <span className={`font-mono text-lg ${timeRemaining < 600 ? 'text-red-500' : 'text-white'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            {/* Submit Button */}
            <Button 
              onClick={() => setShowSubmitConfirm(true)}
              className="bg-green-600 hover:bg-green-700"
              disabled={submittingExam}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Exam
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-4">
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl text-white">
                Question {currentQuestionIndex + 1}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {currentQuestion?.points} point{currentQuestion?.points !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFlagQuestion(currentQuestion.id)}
                  className={`${
                    currentAnswer?.flagged 
                      ? 'text-yellow-500 hover:text-yellow-400' 
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {/* Question Text */}
              <div className="text-lg text-white leading-relaxed">
                {currentQuestion?.question_text}
              </div>
              
              {/* Answer Options */}
              <RadioGroup
                value={currentAnswer?.selectedAnswer || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value as 'A' | 'B' | 'C' | 'D')}
                className="space-y-4"
              >
                {[
                  { value: 'A', text: currentQuestion?.option_a },
                  { value: 'B', text: currentQuestion?.option_b },
                  { value: 'C', text: currentQuestion?.option_c },
                  { value: 'D', text: currentQuestion?.option_d },
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors">
                    <RadioGroupItem 
                      value={option.value} 
                      id={option.value}
                      className="text-blue-500"
                    />
                    <Label 
                      htmlFor={option.value} 
                      className="flex-1 text-white cursor-pointer"
                    >
                      <span className="font-medium text-blue-400 mr-2">{option.value}.</span>
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => handleNavigation('prev')}
            disabled={currentQuestionIndex === 0}
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-4">
            {getFlaggedCount() > 0 && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                <Flag className="h-3 w-3 mr-1" />
                {getFlaggedCount()} flagged
              </Badge>
            )}
            
            <span className="text-gray-400 text-sm">
              {getAnsweredCount()} of {questions.length} completed
            </span>
          </div>
          
          <Button
            variant="outline"
            onClick={() => handleNavigation('next')}
            disabled={currentQuestionIndex === questions.length - 1}
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </main>

      {/* Submit Confirmation Dialog */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-white">Submit Exam?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Are you sure you want to submit your exam? This action cannot be undone.
                </p>
                
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Answered Questions:</span>
                    <span className="text-green-400">{getAnsweredCount()}/{questions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Flagged Questions:</span>
                    <span className="text-yellow-400">{getFlaggedCount()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Time Remaining:</span>
                    <span className="text-blue-400">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
                
                {getAnsweredCount() < questions.length && (
                  <Alert className="border-orange-500 bg-orange-500/10">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <AlertDescription className="text-orange-300">
                      You have {questions.length - getAnsweredCount()} unanswered questions.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSubmitConfirm(false)}
                    className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                    disabled={submittingExam}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitExam}
                    disabled={submittingExam}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {submittingExam ? 'Submitting...' : 'Submit Exam'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExamInterface;
