import { action } from '@uibakery/data';

function loadExamSessions() {
  return action('loadExamSessions', 'SQL', {
    databaseName: '[Sample] Custom App_PifrW2Hk5t',
    query: `
      SELECT 
        es.id,
        es.exam_id,
        es.student_id,
        es.status,
        es.started_at,
        es.completed_at,
        es.final_score,
        es.violation_count,
        e.title as exam_title,
        e.duration_minutes,
        u.full_name as student_name
      FROM exam_sessions es
      JOIN exams e ON es.exam_id = e.id
      JOIN users u ON es.student_id = u.id
      WHERE es.student_id = {{ params.studentId }}
      ORDER BY es.started_at DESC
    `,
  });
}

export default loadExamSessions;
