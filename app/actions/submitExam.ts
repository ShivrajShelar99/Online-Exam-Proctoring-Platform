import { action } from '@uibakery/data';

function submitExam() {
  return action('submitExam', 'SQL', {
    databaseName: '[Sample] Custom App_PifrW2Hk5t',
    query: `
      UPDATE exam_sessions 
      SET 
        status = 'completed',
        completed_at = NOW(),
        final_score = (
          SELECT 
            COALESCE(
              ROUND(
                (SUM(CASE WHEN sa.selected_answer = q.correct_answer THEN q.points ELSE 0 END) * 100.0) / 
                NULLIF(SUM(q.points), 0)
              , 2), 0
            ) as score
          FROM student_answers sa
          JOIN questions q ON sa.question_id = q.id
          WHERE sa.session_id = {{ params.sessionId }}
        )
      WHERE id = {{ params.sessionId }}
    `,
  });
}

export default submitExam;
