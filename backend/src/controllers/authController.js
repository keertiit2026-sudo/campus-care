import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/storage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campuscare_super_secret_jwt_key_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const createToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// 1. Student Self-Registration
export const register = (req, res) => {
  try {
    const { name, email, password, studentId, department, year, hostel } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `usr_stu_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'student',
      studentId: studentId ? studentId.trim() : `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      department: department ? department.trim() : 'Undergraduate Studies',
      year: year ? year.trim() : '1st Year',
      hostel: hostel ? hostel.trim() : 'Day Scholar',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);

    const token = createToken(newUser.id, newUser.role);
    const { passwordHash: _, ...userSafe } = newUser;

    res.status(201).json({
      message: 'Student registration successful.',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

// 2. Universal Login (Student, Staff, Admin)
export const login = (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.email || req.body.studentId;
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Student ID and password are required.' });
    }

    const user = db.findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid Student ID/email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Student ID/email or password.' });
    }

    const token = createToken(user.id, user.role);
    const { passwordHash: _, ...userSafe } = user;

    res.json({
      message: 'Login successful.',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// 3. Get Current Authenticated Profile
export const getMe = (req, res) => {
  res.json({ user: req.user });
};

// 4. Update Profile
export const updateProfile = (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, department, year, hostel, avatar, designation, bio, emergencyContact } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (department) updates.department = department.trim();
    if (year) updates.year = year.trim();
    if (hostel) updates.hostel = hostel.trim();
    if (avatar) updates.avatar = avatar.trim();
    if (designation) updates.designation = designation.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (emergencyContact !== undefined) updates.emergencyContact = emergencyContact.trim();

    const updated = db.updateUser(userId, updates);
    if (!updated) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const { passwordHash: _, ...userSafe } = updated;
    res.json({
      message: 'Profile updated successfully.',
      user: userSafe
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error during profile update.' });
  }
};

// 5. Change Password
export const changePassword = (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (user.passwordHash && currentPassword) {
      const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    db.updateUser(userId, { passwordHash });

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error during password change.' });
  }
};

