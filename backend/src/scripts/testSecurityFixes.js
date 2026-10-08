import { submitRating } from '../controllers/complaintsController.js';
import { db } from '../db/storage.js';

// Mock storage and test submitRating authorization
async function testRatingOwnership() {
  console.log('🧪 Testing Fix 2: Complaint Rating Ownership Security Check...');

  // Mock complaint belonging to Student A
  const mockComplaint = {
    id: 'CMP-TEST-OWNER-01',
    title: 'Test Complaint',
    status: 'Resolved',
    student: {
      id: 'usr_stu_studentA',
      name: 'Student A',
      email: 'studenta@college.edu',
      studentId: 'STU-A'
    },
    rating: null,
    feedback: null
  };

  // Mock db methods for this test
  db.findComplaintById = async (id) => {
    if (id === mockComplaint.id) return mockComplaint;
    return null;
  };

  db.updateComplaint = async (id, updates) => {
    return { ...mockComplaint, ...updates };
  };

  // 1. Test Student B attempting to rate Student A's complaint
  const reqStudentB = {
    params: { id: 'CMP-TEST-OWNER-01' },
    body: { rating: 5, feedback: 'Rating by another student' },
    user: {
      id: 'usr_stu_studentB',
      name: 'Student B',
      email: 'studentb@college.edu',
      studentId: 'STU-B',
      role: 'student'
    }
  };

  let studentBStatus = null;
  let studentBResponse = null;
  const resStudentB = {
    status: (code) => {
      studentBStatus = code;
      return {
        json: (data) => {
          studentBResponse = data;
        }
      };
    },
    json: (data) => {
      studentBResponse = data;
    }
  };

  await submitRating(reqStudentB, resStudentB);

  console.log(`   • Student B unauthorized rating attempt: HTTP ${studentBStatus} - "${studentBResponse?.error}"`);
  if (studentBStatus !== 403) {
    throw new Error('SECURITY FAILED: Student B was not rejected with HTTP 403.');
  }
  console.log('   ✅ PASS: Unauthorized student rating blocked with HTTP 403.');

  // 2. Test Student A rating their own complaint
  const reqStudentA = {
    params: { id: 'CMP-TEST-OWNER-01' },
    body: { rating: 5, feedback: 'Great job!' },
    user: {
      id: 'usr_stu_studentA',
      name: 'Student A',
      email: 'studenta@college.edu',
      studentId: 'STU-A',
      role: 'student'
    }
  };

  let studentAStatus = 200;
  let studentAResponse = null;
  const resStudentA = {
    status: (code) => {
      studentAStatus = code;
      return {
        json: (data) => {
          studentAResponse = data;
        }
      };
    },
    json: (data) => {
      studentAResponse = data;
    }
  };

  await submitRating(reqStudentA, resStudentA);

  console.log(`   • Student A authorized rating attempt: HTTP ${studentAStatus} - Rating: ${studentAResponse?.complaint?.rating}`);
  if (studentAResponse?.complaint?.rating !== 5) {
    throw new Error('SECURITY FAILED: Student A rating could not be submitted.');
  }
  console.log('   ✅ PASS: Complaint owner rating successfully accepted.\n');

  console.log('🎉 ALL SECURITY FIX VERIFICATIONS PASSED CLEANLY!');
}

testRatingOwnership().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
