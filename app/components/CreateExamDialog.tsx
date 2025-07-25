import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import { useMutateAction } from '@uibakery/data';

interface Question {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: string[];
  correct_answer: string;
  points: number;
}

interface CreateExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: () => void;
  instructorId: number;
}

const CreateExamDialog: React.FC<CreateExamDialogProps> = ({
  isOpen,
  onClose,
  onExamCreated,
  instructorId
}) => {
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration_minutes: 60,
    passing_score: 70,
    start_time: '',
    end_time: ''
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1
  });

  const handleAddQuestion = () => {
    if (currentQuestion.question_text.trim() && currentQuestion.correct_answer) {
      setQuestions([...questions, { ...currentQuestion }]);
      setCurrentQuestion({
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 1
      });
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[optionIndex] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleCreateExam = async () => {
    if (!examData.title.trim() || questions.length === 0) {
      alert('Please provide exam title and at least one question');
      return;
    }

    try {
      // In a real implementation, you would create exam creation actions
      // For now, we'll simulate success
      console.log('Creating exam:', { examData, questions, instructorId });
      onExamCreated();
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Exam Info */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    value={examData.title}
                    onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                    placeholder="Enter exam title"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={examData.duration_minutes}
                    onChange={(e) => setExamData({ ...examData, duration_minutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={examData.description}
                  onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                  placeholder="Enter exam description"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="passing_score">Passing Score (%)</Label>
                  <Input
                    id="passing_score"
                    type="number"
                    min="0"
                    max="100"
                    value={examData.passing_score}
                    onChange={(e) => setExamData({ ...examData, passing_score: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={examData.start_time}
                    onChange={(e) => setExamData({ ...examData, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={examData.end_time}
                    onChange={(e) => setExamData({ ...examData, end_time: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Add Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question_text">Question Text</Label>
                <Textarea
                  id="question_text"
                  value={currentQuestion.question_text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                  placeholder="Enter your question"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="question_type">Question Type</Label>
                  <select
                    id="question_type"
                    className="w-full p-2 border rounded-md"
                    value={currentQuestion.question_type}
                    onChange={(e) => setCurrentQuestion({ 
                      ...currentQuestion, 
                      question_type: e.target.value as 'multiple_choice' | 'true_false',
                      options: e.target.value === 'true_false' ? ['True', 'False', '', ''] : ['', '', '', '']
                    })}
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              {/* Options */}
              <div>
                <Label>Answer Options</Label>
                <div className="space-y-2">
                  {currentQuestion.question_type === 'multiple_choice' ? (
                    currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                        />
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={currentQuestion.correct_answer === option}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correct_answer: option })}
                        />
                        <Label className="text-sm">Correct</Label>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-20">True</span>
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={currentQuestion.correct_answer === 'True'}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correct_answer: 'True' })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-20">False</span>
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={currentQuestion.correct_answer === 'False'}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correct_answer: 'False' })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <Button onClick={handleAddQuestion} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          {/* Questions List */}
          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Questions ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <p className="text-gray-600 mt-1">{question.question_text}</p>
                          <div className="mt-2 text-sm">
                            <p><strong>Type:</strong> {question.question_type}</p>
                            <p><strong>Points:</strong> {question.points}</p>
                            <p><strong>Correct Answer:</strong> {question.correct_answer}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRemoveQuestion(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreateExam}>
              <Save className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExamDialog;
