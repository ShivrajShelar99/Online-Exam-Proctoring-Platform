import { action } from '@uibakery/data';

function submitAnswer() {
  return action('submitAnswer', 'SQL', {
    databaseName: '[Sample] Custom App_PifrW2Hk5t',
    query: `
      INSERT INTO student_answers (session_id, question_id, selected_answer, answered_at)
      VALUES ({{ params.sessionId }}, {{ params.questionId }}, {{ params.selectedAnswer }}, NOW())
      ON CONFLICT (session_id, question_id)
      DO UPDATE SET 
        selected_answer = {{ params.selectedAnswer }},
        answered_at = NOW()
    `,
  });
}

export default submitAnswer;
