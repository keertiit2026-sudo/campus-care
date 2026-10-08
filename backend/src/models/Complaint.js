import mongoose from 'mongoose';

// Subdocument Schema for Transfer / Handover details
const transferDetailsSchema = new mongoose.Schema(
  {
    oldStaffId: { type: String },
    oldStaffName: { type: String },
    newStaffId: { type: String },
    newStaffName: { type: String },
    reason: { type: String },
    performedBy: { type: String },
    timestamp: { type: Date }
  },
  { _id: false }
);

// Subdocument Schema for Status History & Audit Logs
const statusHistorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    fromStatus: { type: String, default: null },
    toStatus: { type: String, required: true },
    changedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    transferDetails: { type: transferDetailsSchema, default: null }
  },
  { _id: false }
);

// Subdocument Schema for Student-Staff Comments
const commentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, required: true },
    authorAvatar: { type: String },
    timestamp: { type: Date, default: Date.now },
    message: { type: String, required: true },
    isInternal: { type: Boolean, default: false }
  },
  { _id: false }
);

// Subdocument Schema for Student snapshot
const studentSnapshotSchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String },
    studentId: { type: String },
    email: { type: String },
    department: { type: String },
    avatar: { type: String }
  },
  { _id: false }
);

// Subdocument Schema for Structured Locations
const manualLocationSchema = new mongoose.Schema(
  {
    building: { type: String, default: '' },
    floor: { type: String, default: '' },
    roomOrSpot: { type: String, default: '' },
    additionalDetails: { type: String, default: '' }
  },
  { _id: false }
);

const gpsLocationSchema = new mongoose.Schema(
  {
    address: { type: String, default: '' }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    // Custom Complaint Reference (e.g. CMP-2026-1001)
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent', 'critical'],
      default: 'medium',
      index: true
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Pending',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
        'Escalated'
      ],
      default: 'Submitted',
      index: true
    },
    location: {
      type: String,
      trim: true
    },
    manualLocation: {
      type: manualLocationSchema,
      default: () => ({})
    },
    gpsLocation: {
      type: gpsLocationSchema,
      default: () => ({})
    },
    floorLevel: {
      type: String,
      default: 'Ground Floor'
    },
    student: {
      type: studentSnapshotSchema,
      required: true
    },
    assignedDepartment: {
      type: String,
      default: null,
      index: true
    },
    assignedStaff: {
      type: String,
      default: null,
      index: true
    },
    attachments: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    },
    comments: {
      type: [commentSchema],
      default: []
    },
    resolutionNotes: {
      type: String,
      default: null
    },
    resolutionPhoto: {
      type: String,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    feedback: {
      type: String,
      default: null
    },
    intelligence: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    linkedComplaintIds: {
      type: [String],
      default: []
    },
    hasLinkedTickets: {
      type: Boolean,
      default: false
    },
    duplicateOf: {
      type: String,
      default: null
    },
    linkType: {
      type: String,
      default: null
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
    timestamps: false, // Managed manually to preserve historical import timestamps
    versionKey: false
  }
);

// Compound indexes for fast admin querying & analytics
complaintSchema.index({ 'student.id': 1 });
complaintSchema.index({ 'student.email': 1 });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ assignedDepartment: 1, status: 1 });
complaintSchema.index({ assignedStaff: 1, status: 1 });

export const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
