import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

const TOKEN_KEY = 'campuscare_jwt_token';
const USER_KEY = 'campuscare_user_profile';

const DEFAULT_PRESET_STUDENTS = [
  {
    id: 'usr_stu_1790044600000',
    name: 'Apeksha',
    email: 'swamyapeksha@gmail.com',
    studentId: 'STU-2026-APEKSHA',
    department: 'Computer Science & Engineering',
    year: '1st Year',
    hostel: 'Day Scholar',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Apeksha',
    enrollmentStatus: 'Enrolled & Verified',
    portalRole: 'student',
    registeredBatch: 'Academic Year 2025–2029',
    slaTier: 'Standard Tier (24h)'
  },
  {
    id: 'usr_stu_1790044542789',
    name: 'kerti',
    email: 'jcer@2026',
    studentId: 'cs2025035',
    department: 'Computer Science & Engineering',
    year: '1st Year',
    hostel: 'Day Scholar',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kerti',
    enrollmentStatus: 'Enrolled & Verified',
    portalRole: 'student',
    registeredBatch: 'Academic Year 2025–2029',
    slaTier: 'Standard Tier (24h)'
  },
  {
    id: 'usr_student_1',
    name: 'Priya Sharma',
    email: 'priya.sharma@college.edu',
    studentId: 'STU-2024-8841',
    department: 'Computer Science & Engineering',
    year: '3rd Year (Semester 5)',
    hostel: 'Gargi Hall, Room 314',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    enrollmentStatus: 'Enrolled & Verified',
    portalRole: 'student',
    registeredBatch: 'Academic Year 2024–2028',
    slaTier: 'Standard Tier (24h)'
  }
];

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  // Clean up any legacy insecure password caches from localStorage on initialization
  useEffect(() => {
    try {
      localStorage.removeItem('campuscare_user_passwords');
      
      const savedRegistryRaw = localStorage.getItem('campuscare_student_registry_v1');
      const savedRegistry = savedRegistryRaw ? JSON.parse(savedRegistryRaw) : [];
      let updated = false;

      DEFAULT_PRESET_STUDENTS.forEach((preset) => {
        if (!savedRegistry.some((s) => s.email && s.email.toLowerCase() === preset.email.toLowerCase())) {
          savedRegistry.unshift(preset);
          updated = true;
        }
      });

      if (updated || !savedRegistryRaw) {
        localStorage.setItem('campuscare_student_registry_v1', JSON.stringify(savedRegistry));
      }
    } catch (e) {
      console.warn('Could not sync default directory in localStorage:', e);
    }
  }, []);

  // Sync token and user profile
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  // Helper to store safe active user profile (without credentials)
  const persistStudentData = (studentObj) => {
    if (!studentObj) return studentObj;

    const fullStudent = {
      id: studentObj.id || `usr_stu_${Date.now()}`,
      name: studentObj.name || 'Student User',
      email: (studentObj.email || '').toLowerCase().trim(),
      role: studentObj.role || 'student',
      portalRole: studentObj.portalRole || studentObj.role || 'student',
      studentId:
        studentObj.studentId ||
        `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      department: studentObj.department || 'Computer Science & Engineering',
      year: studentObj.year || '1st Year',
      hostel: studentObj.hostel || 'Day Scholar',
      enrollmentStatus: studentObj.enrollmentStatus || 'Enrolled & Verified',
      registeredBatch:
        studentObj.registeredBatch ||
        `Academic Year ${new Date().getFullYear()}–${new Date().getFullYear() + 4}`,
      slaTier: studentObj.slaTier || 'Standard Tier (24h)',
      avatar:
        studentObj.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          studentObj.name || 'student'
        )}`,
      createdAt: studentObj.createdAt || new Date().toISOString()
    };

    // Save active user profile (safe profile without passwords)
    localStorage.setItem(USER_KEY, JSON.stringify(fullStudent));

    // Save/Update in student registry for directory
    if (fullStudent.role === 'student') {
      try {
        const savedRegistryRaw = localStorage.getItem('campuscare_student_registry_v1');
        const savedRegistry = savedRegistryRaw ? JSON.parse(savedRegistryRaw) : [];
        const existingIdx = savedRegistry.findIndex(
          (s) =>
            (s.email && s.email.toLowerCase() === fullStudent.email.toLowerCase()) ||
            (s.studentId && s.studentId.toLowerCase() === fullStudent.studentId.toLowerCase())
        );

        if (existingIdx >= 0) {
          savedRegistry[existingIdx] = { ...savedRegistry[existingIdx], ...fullStudent };
        } else {
          savedRegistry.unshift(fullStudent);
        }
        localStorage.setItem('campuscare_student_registry_v1', JSON.stringify(savedRegistry));
      } catch (e) {
        console.warn('Could not update student registry:', e);
      }
    }

    return fullStudent;
  };

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      const storedUser = persistStudentData(res.user);
      setToken(res.token);
      setUser(storedUser);
      if (res.token) localStorage.setItem(TOKEN_KEY, res.token);
      setAuthModalOpen(false);
      return storedUser;
    } catch (apiErr) {
      console.warn('Login request failed:', apiErr.message);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  };

  // Register student handler
  const register = async (studentData) => {
    setLoading(true);
    try {
      const res = await api.register(studentData);
      const storedUser = persistStudentData(res.user || studentData);
      setToken(res.token);
      setUser(storedUser);
      if (res.token) localStorage.setItem(TOKEN_KEY, res.token);
      setAuthModalOpen(false);
      return storedUser;
    } catch (apiErr) {
      console.warn('Registration request failed:', apiErr.message);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  };

  // Update User Profile
  const updateProfile = async (updatedData) => {
    setLoading(true);
    try {
      let updatedUser = { ...user, ...updatedData };
      try {
        const res = await api.updateProfile(updatedData);
        if (res?.user) {
          updatedUser = { ...updatedUser, ...res.user };
        }
      } catch (apiErr) {
        console.warn('Backend API updateProfile error:', apiErr.message);
      }
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      return true;
    } catch (apiErr) {
      console.error('Password change error:', apiErr.message);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  };

  // Secure Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        updateProfile,
        changePassword,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
