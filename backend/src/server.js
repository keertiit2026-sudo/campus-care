import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticate, requireRole } from './middleware/auth.js';
import * as authCtrl from './controllers/authController.js';
import * as complaintsCtrl from './controllers/complaintsController.js';
import * as deptsCtrl from './controllers/departmentsController.js';
import * as analyticsCtrl from './controllers/analyticsController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'CampusCare API Server',
    time: new Date().toISOString()
  });
});

// --- Auth Routes ---
app.post('/api/auth/register', authCtrl.register);
app.post('/api/auth/login', authCtrl.login);
app.get('/api/auth/me', authenticate, authCtrl.getMe);

// --- Complaints Routes ---
app.get('/api/complaints', authenticate, complaintsCtrl.getComplaints);
app.post('/api/complaints', authenticate, complaintsCtrl.createComplaint);
app.get('/api/complaints/:id', authenticate, complaintsCtrl.getComplaintById);
app.patch('/api/complaints/:id/triage', authenticate, requireRole('admin', 'staff'), complaintsCtrl.triageComplaint);
app.post('/api/complaints/:id/comments', authenticate, complaintsCtrl.addComment);
app.post('/api/complaints/:id/rating', authenticate, requireRole('student'), complaintsCtrl.submitRating);

// --- Departments & Staff Directory ---
app.get('/api/departments', authenticate, deptsCtrl.getDepartments);
app.patch('/api/departments/:id', authenticate, requireRole('admin'), deptsCtrl.updateDepartment);
app.get('/api/staff', authenticate, deptsCtrl.getStaff);
app.post('/api/staff', authenticate, requireRole('admin'), deptsCtrl.createStaff);
app.get('/api/staff/:id', authenticate, deptsCtrl.getStaffById);
app.get('/api/staff/:id/open-tickets', authenticate, deptsCtrl.getStaffOpenTickets);
app.patch('/api/staff/:id', authenticate, requireRole('admin'), deptsCtrl.updateStaff);
app.post('/api/staff/replace', authenticate, requireRole('admin'), deptsCtrl.replaceAndTransferStaff);
app.post('/api/staff/:id/replace', authenticate, requireRole('admin'), (req, res) => {
  req.body.oldStaffId = req.params.id;
  return deptsCtrl.replaceAndTransferStaff(req, res);
});
app.post('/api/staff/:id/deactivate', authenticate, requireRole('admin'), deptsCtrl.deactivateStaff);
app.post('/api/staff/:id/reactivate', authenticate, requireRole('admin'), deptsCtrl.reactivateStaff);
app.delete('/api/staff/:id', authenticate, requireRole('admin'), deptsCtrl.deleteStaff);

// --- Analytics ---
app.get('/api/analytics', authenticate, analyticsCtrl.getAnalytics);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 CampusCare REST API Server running at http://localhost:${PORT}`);
  console.log(`✨ Default Admin: ${process.env.ADMIN_EMAIL || 'admin@college.edu'} | Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
});
