import { User } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';
import { Department } from '../models/Department.js';

class MongoStorage {
  // --- User Operations ---
  async findUserByEmail(email) {
    if (!email) return null;
    return await User.findOne({ email: email.toLowerCase().trim() }).lean();
  }

  async findUserByIdentifier(identifier) {
    if (!identifier) return null;
    const lower = identifier.toLowerCase().trim();
    return await User.findOne({
      $or: [
        { email: lower },
        { studentId: { $regex: new RegExp(`^${lower}$`, 'i') } },
        { id: lower }
      ]
    }).lean();
  }

  async findUserById(id) {
    if (!id) return null;
    return await User.findOne({ id }).lean();
  }

  async createUser(userData) {
    const user = new User(userData);
    await user.save();
    return user.toObject();
  }

  async updateUser(id, updates) {
    const updated = await User.findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    ).lean();
    return updated;
  }

  async getStaffMembers(statusFilter = 'active') {
    const query = { role: 'staff' };
    if (statusFilter !== 'all') {
      query.status = statusFilter || 'active';
    }
    return await User.find(query).lean();
  }

  async getStaff(statusFilter = 'active') {
    return await this.getStaffMembers(statusFilter);
  }

  async findStaffById(id) {
    if (!id) return null;
    return await User.findOne({ id, role: 'staff' }).lean();
  }

  async findStaffOpenTickets(staffId) {
    if (!staffId) return [];
    return await Complaint.find({
      assignedStaff: staffId,
      status: { $nin: ['Resolved', 'Closed'] }
    }).lean();
  }

  async findStaffResolvedTickets(staffId) {
    if (!staffId) return [];
    return await Complaint.find({
      assignedStaff: staffId,
      status: { $in: ['Resolved', 'Closed'] }
    }).lean();
  }

  // --- Complaint Operations ---
  async getComplaints(filter = {}) {
    return await Complaint.find(filter).sort({ createdAt: -1 }).lean();
  }

  async findComplaintById(id) {
    if (!id) return null;
    return await Complaint.findOne({ id }).lean();
  }

  async createComplaint(complaintData) {
    const complaint = new Complaint(complaintData);
    await complaint.save();
    return complaint.toObject();
  }

  async updateComplaint(id, updates) {
    const updated = await Complaint.findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    ).lean();
    return updated;
  }

  // --- Department Operations ---
  async getDepartments() {
    return await Department.find().sort({ id: 1 }).lean();
  }

  async findDepartmentById(id) {
    if (!id) return null;
    return await Department.findOne({ id }).lean();
  }

  async updateDepartment(id, updates) {
    const updated = await Department.findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    ).lean();
    return updated;
  }

  // --- Staff Management Operations ---
  async updateStaff(id, updates) {
    const updated = await User.findOneAndUpdate(
      { id, role: 'staff' },
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    ).lean();
    return updated;
  }

  async deleteStaff(id) {
    const staff = await User.findOneAndUpdate(
      { id, role: 'staff' },
      { $set: { status: 'inactive', leftAt: new Date(), updatedAt: new Date() } },
      { new: true }
    ).lean();
    return !!staff;
  }

  /**
   * Replace Staff & Transfer Open Complaints safely
   */
  async replaceStaffAndTransferComplaints({
    oldStaffId,
    newStaffId,
    complaintIds = null,
    reason = 'Staff replacement',
    departureStatus = 'left_college',
    adminName = 'Administrator'
  }) {
    const oldStaff = await this.findStaffById(oldStaffId);
    if (!oldStaff) {
      throw new Error(`Original staff member with ID ${oldStaffId} was not found.`);
    }

    const newStaff = await this.findStaffById(newStaffId);
    if (!newStaff) {
      throw new Error(`Replacement staff member with ID ${newStaffId} was not found.`);
    }

    if (newStaff.id === oldStaff.id) {
      throw new Error('Replacement staff member cannot be the same as the departing staff member.');
    }

    if (newStaff.status !== 'active') {
      throw new Error(
        `Replacement staff member ${newStaff.name} is not active (${newStaff.status}) and cannot accept complaint assignments.`
      );
    }

    // Find all eligible open complaints for old staff
    const allOpenComplaints = await Complaint.find({
      assignedStaff: oldStaffId,
      status: { $nin: ['Resolved', 'Closed'] }
    }).lean();

    // Filter target complaints to transfer
    let targetComplaints = [];
    if (Array.isArray(complaintIds) && complaintIds.length > 0) {
      const idSet = new Set(complaintIds);
      targetComplaints = allOpenComplaints.filter((c) => idSet.has(c.id));
    } else {
      targetComplaints = allOpenComplaints;
    }

    const now = new Date();
    const formattedDate = now.toLocaleString();
    const transferredSummary = [];

    // Transfer each complaint and append audit log entry
    for (const c of targetComplaints) {
      const auditEntry = {
        id: `sh-transfer-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        fromStatus: c.status,
        toStatus: c.status,
        changedBy: `${adminName} (Admin)`,
        timestamp: now,
        note: `Assigned to ${oldStaff.name} → Reassigned to ${newStaff.name}. Reassigned by ${adminName} on ${formattedDate}. Reason: ${reason}.`,
        transferDetails: {
          oldStaffId: oldStaff.id,
          oldStaffName: oldStaff.name,
          newStaffId: newStaff.id,
          newStaffName: newStaff.name,
          reason,
          performedBy: adminName,
          timestamp: now
        }
      };

      await Complaint.findOneAndUpdate(
        { id: c.id },
        {
          $set: {
            assignedStaff: newStaff.id,
            assignedDepartment: newStaff.departmentId || c.assignedDepartment,
            updatedAt: now
          },
          $push: { statusHistory: auditEntry }
        }
      );

      transferredSummary.push({
        id: c.id,
        title: c.title,
        status: c.status,
        priority: c.priority
      });
    }

    // Update old staff status and departure metadata
    const updatedStatus = departureStatus === 'inactive' ? 'inactive' : 'left_college';
    await User.findOneAndUpdate(
      { id: oldStaffId },
      {
        $set: {
          status: updatedStatus,
          leftAt: now,
          resignationReason: reason,
          updatedAt: now
        }
      }
    );

    return {
      success: true,
      transferredCount: targetComplaints.length,
      transferredComplaints: transferredSummary,
      oldStaff: {
        id: oldStaff.id,
        name: oldStaff.name,
        status: updatedStatus,
        department: oldStaff.department
      },
      newStaff: {
        id: newStaff.id,
        name: newStaff.name,
        status: newStaff.status,
        department: newStaff.department
      },
      auditRecordsCount: targetComplaints.length
    };
  }

  /**
   * Deactivate staff safely (blocks if open tickets exist unless transferred)
   */
  async deactivateStaff(staffId, targetStatus = 'inactive', reason = '', adminName = 'Administrator') {
    const staff = await this.findStaffById(staffId);
    if (!staff) {
      throw new Error(`Staff member with ID ${staffId} not found.`);
    }

    const openTickets = await this.findStaffOpenTickets(staffId);
    if (openTickets.length > 0) {
      const error = new Error(
        `Cannot mark as ${
          targetStatus === 'left_college' ? 'Left College' : 'Inactive'
        } yet. This staff member currently has ${openTickets.length} open complaint(s). Please transfer open complaints to another active staff member first.`
      );
      error.statusCode = 400;
      error.openCount = openTickets.length;
      error.openTickets = openTickets.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority
      }));
      throw error;
    }

    const updatedStatus = targetStatus === 'left_college' ? 'left_college' : 'inactive';
    const updated = await User.findOneAndUpdate(
      { id: staffId },
      {
        $set: {
          status: updatedStatus,
          leftAt: new Date(),
          resignationReason: reason || null,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).lean();

    const { passwordHash: _, ...safeStaff } = updated;
    return safeStaff;
  }

  /**
   * Reactivate staff
   */
  async reactivateStaff(staffId) {
    const staff = await this.findStaffById(staffId);
    if (!staff) {
      throw new Error(`Staff member with ID ${staffId} not found.`);
    }

    const updated = await User.findOneAndUpdate(
      { id: staffId },
      {
        $set: {
          status: 'active',
          leftAt: null,
          resignationReason: null,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).lean();

    const { passwordHash: _, ...safeStaff } = updated;
    return safeStaff;
  }
}

export const db = new MongoStorage();
export default db;
