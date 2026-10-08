import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // Custom Application ID (e.g. usr_admin_1, usr_stu_179..., usr_staff_1)
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'staff', 'admin'],
      required: true,
      default: 'student',
      index: true
    },
    portalRole: {
      type: String,
      default: 'student'
    },

    // Student profile fields
    studentId: {
      type: String,
      trim: true,
      index: true
    },
    department: {
      type: String,
      trim: true
    },
    year: {
      type: String,
      trim: true
    },
    hostel: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      trim: true
    },
    enrollmentStatus: {
      type: String,
      default: 'Enrolled & Verified'
    },
    registeredBatch: {
      type: String,
      trim: true
    },
    slaTier: {
      type: String,
      default: 'Standard Tier (24h)'
    },
    designation: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    emergencyContact: {
      type: String,
      trim: true
    },

    // Staff & Faculty specific fields
    employeeId: {
      type: String,
      trim: true,
      index: true
    },
    departmentId: {
      type: String,
      trim: true,
      index: true
    },
    roleTitle: {
      type: String,
      trim: true
    },
    categoryResponsibility: {
      type: String,
      trim: true,
      default: 'general'
    },
    campusZone: {
      type: String,
      trim: true,
      default: 'Main Campus'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'left_college'],
      default: 'active',
      index: true
    },
    joinedAt: {
      type: Date
    },
    leftAt: {
      type: Date
    },
    resignationReason: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false, // Managed manually to preserve historical import dates
    versionKey: false
  }
);

// Helpful transformations: expose safe object without passwordHash
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj._id;
  return obj;
};

export const User = mongoose.model('User', userSchema);
export default User;
