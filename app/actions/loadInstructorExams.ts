import { action } from '@uibakery/data';

function loadInstructorExams() {
  return action('loadInstructorExams', 'SQL', {
    databaseName: '[Sample] Custom App_PifrW2Hk5t',
    query: `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.duration_minutes,
        e.start_time,
        e.end_time,
        e.is_active,
        e.passing_score,
        COUNT(DISTINCT q.id) as total_questions,
        COUNT(DISTINCT CASE WHEN es.status = 'in_progress' THEN es.id END) as active_sessions,
        COUNT(DISTINCT CASE WHEN es.status = 'completed' THEN es.id END) as completed_sessions
      FROM exams e
      LEFT JOIN questions q ON e.id = q.exam_id
      LEFT JOIN exam_sessions es ON e.id = es.exam_id
      WHERE e.instructor_id = {{ params.instructorId }}
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `,
  });
}

export default loadInstructorExams;
