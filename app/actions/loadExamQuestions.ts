import { action } from '@uibakery/data';

function loadExamQuestions() {
  return action('loadExamQuestions', 'SQL', {
    databaseName: '[Sample] Custom App_PifrW2Hk5t',
    query: `
      SELECT 
        id,
        exam_id,
        question_text,
        question_type,
        options,
        correct_answer,
        points,
        order_index
      FROM questions 
      WHERE exam_id = {{ params.examId }}
      ORDER BY order_index ASC
    `,
  });
}

export default loadExamQuestions;
