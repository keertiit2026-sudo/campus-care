import React from 'react';
import { useApp } from '../../context/AppContext';
import { StudentDashboard } from '../student/StudentDashboard';
import { AdminDashboard } from '../admin/AdminDashboard';

export const DashboardPage = () => {
  const { currentPersona } = useApp();

  if (currentPersona?.role === 'admin' || currentPersona?.role === 'staff') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
};
