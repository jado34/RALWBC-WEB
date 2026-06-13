import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';

/**
 * ExamRoute — guards /exam/:id
 * Requires:
 *   1. User is logged in as 'ambassador' (role = 'student' in DB)
 *   2. The global exam session is currently active
 *   3. The exam's category matches the user's rankCategory
 *
 * If any check fails, redirects to /dashboard where the
 * Ambassador will see the appropriate closed-portal banner.
 */
export const ExamRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const { id } = useParams();

  // 1. Must be authenticated as an Ambassador (role = 'student')
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role !== 'student') {
    return <Navigate to="/admin" replace />;
  }

  // 2. Session must be active
  if (!dbService.isSessionActive()) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Exam category must match user's rankCategory
  const exam = dbService.getExamById(id);
  if (exam && exam.category && currentUser.rankCategory) {
    if (exam.category !== currentUser.rankCategory) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ExamRoute;
