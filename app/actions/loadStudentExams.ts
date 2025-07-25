import { action } from '@uibakery/data';

function loadStudentExams() {
  return action('loadStudentExams', 'SQL', {
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
        COUNT(q.id) as total_questions,
        es.id as session_id,
        es.status as session_status,
        es.started_at,
        es.completed_at,
        es.final_score,
        u.full_name as instructor_name
      FROM exams e
      JOIN users u ON e.instructor_id = u.id
      LEFT JOIN questions q ON e.id = q.exam_id
      LEFT JOIN exam_sessions es ON e.id = es.exam_id AND es.student_id = {{ params.studentId }}
      WHERE e.is_active = true
        AND e.start_time <= NOW()
        AND e.end_time >= NOW()
      GROUP BY e.id, es.id, u.full_name
      ORDER BY e.start_time ASC
    `,
  });
}

export default loadStudentExams;
