import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    // Custom Department ID (e.g. it_services, electrical, civil, hostel_admin)
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
    code: {
      type: String,
      trim: true,
      uppercase: true
    },
    head: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    slaHours: {
      type: Number,
      default: 24
    },
    staffCount: {
      type: Number,
      default: 0
    },
    location: {
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
    timestamps: false,
    versionKey: false
  }
);

export const Department = mongoose.model('Department', departmentSchema);
export default Department;
