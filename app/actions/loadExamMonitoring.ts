import { action } from '@uibakery/data';

function loadExamMonitoring() {
  return action('loadExamMonitoring', 'SQL', {
    databaseName: '[Sample] Custom App_PifrW2Hk5t',
    query: `
      SELECT 
        es.id,
        u.full_name as student_name,
        u.email as student_email,
        e.title as exam_title,
        es.started_at,
        es.violation_count,
        es.status,
        (e.duration_minutes - EXTRACT(EPOCH FROM (NOW() - es.started_at))/60)::int as time_remaining,
        COALESCE(
          (SELECT COUNT(*) FROM student_answers sa WHERE sa.session_id = es.id), 0
        ) as current_question,
        COUNT(q.id) as total_questions,
        vl.violation_type as last_violation,
        'active' as camera_status,
        'active' as fullscreen_status
      FROM exam_sessions es
      JOIN users u ON es.student_id = u.id
      JOIN exams e ON es.exam_id = e.id
      LEFT JOIN questions q ON e.id = q.exam_id
      LEFT JOIN violation_logs vl ON es.id = vl.session_id AND vl.id = (
        SELECT MAX(id) FROM violation_logs WHERE session_id = es.id
      )
      WHERE es.status = 'in_progress'
        AND (COALESCE({{ params.examId }}, 0) = 0 OR e.id = {{ params.examId }})
      GROUP BY es.id, u.id, e.id, vl.violation_type
      ORDER BY es.started_at DESC
    `,
  });
}

export default loadExamMonitoring;