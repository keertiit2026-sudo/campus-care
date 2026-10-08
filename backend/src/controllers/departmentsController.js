import { db } from '../db/storage.js';
import bcrypt from 'bcryptjs';

// 1. Get All Departments (with active ticket counts and active staff counts)
export const getDepartments = async (req, res) => {
  try {
    const departments = await db.getDepartments();
    const complaints = await db.getComplaints();
    const allStaff = await db.getStaffMembers('all');

    const enriched = departments.map((d) => {
      const activeCount = complaints.filter(
        (c) => c.assignedDepartment === d.id && c.status !== 'Resolved' && c.status !== 'Closed'
      ).length;

      const activeStaffInDept = allStaff.filter(
        (s) => (s.departmentId === d.id || s.department === d.name) && (s.status || 'active') === 'active'
      ).length;

      return {
        ...d,
        activeTickets: activeCount,
        activeStaffCount: activeStaffInDept
      };
    });

    res.json({ departments: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve departments.' });
  }
};

// 2. Update Department Details (Admin only)
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, head, email, phone, slaHours, location, code } = req.body;

    const existing = await db.findDepartmentById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Department not found.' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (head !== undefined) updates.head = head.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone.trim();
    if (slaHours !== undefined) updates.slaHours = Number(slaHours) || 24;
    if (location !== undefined) updates.location = location.trim();
    if (code !== undefined) updates.code = code.trim().toUpperCase();

    const updated = await db.updateDepartment(id, updates);
    res.json({ message: 'Department details updated successfully.', department: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update department.' });
  }
};

// 3. Get Staff Members (with filtering by status and real-time ticket metrics)
export const getStaff = async (req, res) => {
  try {
    const { status, departmentId } = req.query;
    let staffList = await db.getStaffMembers(status || 'active');

    if (departmentId && departmentId !== 'all') {
      staffList = staffList.filter((s) => s.departmentId === departmentId);
    }

    const complaints = await db.getComplaints();
    const departments = await db.getDepartments();
    const deptMap = new Map(departments.map((d) => [d.id, d]));

    const enrichedStaff = staffList.map((u) => {
      const { passwordHash, ...safe } = u;
      const activeTickets = complaints.filter(
        (c) => c.assignedStaff === u.id && c.status !== 'Resolved' && c.status !== 'Closed'
      ).length;
      const resolvedTickets = complaints.filter(
        (c) => c.assignedStaff === u.id && (c.status === 'Resolved' || c.status === 'Closed')
      ).length;

      const dept = deptMap.get(u.departmentId);

      return {
        ...safe,
        status: safe.status || 'active',
        activeTickets,
        resolvedTickets,
        slaHours: dept?.slaHours || 24
      };
    });

    res.json({ staff: enrichedStaff, total: enrichedStaff.length });
  } catch (err) {
    console.error('getStaff error:', err);
    res.status(500).json({ error: 'Failed to retrieve staff list.' });
  }
};

// 4. Get Single Staff Member by ID
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await db.findStaffById(id);

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    const { passwordHash, ...safe } = staff;
    const complaints = await db.getComplaints();

    const openComplaints = complaints.filter(
      (c) => c.assignedStaff === id && c.status !== 'Resolved' && c.status !== 'Closed'
    );
    const resolvedComplaints = complaints.filter(
      (c) => c.assignedStaff === id && (c.status === 'Resolved' || c.status === 'Closed')
    );

    const dept = await db.findDepartmentById(staff.departmentId);

    res.json({
      staff: {
        ...safe,
        status: safe.status || 'active',
        activeTickets: openComplaints.length,
        resolvedTickets: resolvedComplaints.length,
        slaHours: dept?.slaHours || 24,
        openComplaints: openComplaints.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          priority: c.priority,
          status: c.status,
          location: c.location,
          createdAt: c.createdAt
        }))
      }
    });
  } catch (err) {
    console.error('getStaffById error:', err);
    res.status(500).json({ error: 'Failed to retrieve staff member details.' });
  }
};

// 5. Get Open Tickets for a Staff Member
export const getStaffOpenTickets = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await db.findStaffById(id);

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    const openTickets = (await db.findStaffOpenTickets(id)).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      priority: c.priority,
      status: c.status,
      location: c.location,
      createdAt: c.createdAt,
      student: c.student
    }));

    res.json({
      staffId: id,
      staffName: staff.name,
      totalOpen: openTickets.length,
      tickets: openTickets
    });
  } catch (err) {
    console.error('getStaffOpenTickets error:', err);
    res.status(500).json({ error: 'Failed to retrieve staff open tickets.' });
  }
};

// 6. Add New Staff / Faculty (Admin only)
export const createStaff = async (req, res) => {
  try {
    const {
      name,
      employeeId,
      email,
      departmentId,
      department,
      roleTitle,
      categoryResponsibility,
      campusZone,
      phone,
      status,
      password
    } = req.body;

    if (!name || !email || !departmentId) {
      return res.status(400).json({ error: 'Staff name, email, and assigned department are required.' });
    }

    const existing = await db.findUserByEmail(email.trim());
    if (existing) {
      return res.status(409).json({ error: 'A user account with this email address already exists.' });
    }

    const deptObj = await db.findDepartmentById(departmentId);
    const deptName = department || (deptObj ? deptObj.name : 'Maintenance Department');

    const salt = bcrypt.genSaltSync(10);
    const rawPassword = password || 'staff123';
    const passwordHash = bcrypt.hashSync(rawPassword, salt);

    const generatedEmpId = employeeId ? employeeId.trim() : `EMP-${Date.now().toString().slice(-4)}`;

    const newStaff = {
      id: `usr_staff_${Date.now()}`,
      employeeId: generatedEmpId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'staff',
      status: status === 'inactive' ? 'inactive' : 'active',
      departmentId,
      department: deptName,
      roleTitle: roleTitle ? roleTitle.trim() : 'Technician & Maintenance Officer',
      categoryResponsibility: categoryResponsibility || 'general',
      campusZone: campusZone ? campusZone.trim() : 'Main Campus',
      phone: phone ? phone.trim() : '+1 (555) 019-400',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      joinedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await db.createUser(newStaff);

    const { passwordHash: _, ...safeStaff } = newStaff;
    res.status(201).json({
      message: `Staff member ${newStaff.name} (${newStaff.employeeId}) added successfully.`,
      staff: safeStaff
    });
  } catch (err) {
    console.error('createStaff error:', err);
    res.status(500).json({ error: 'Failed to add new staff member.' });
  }
};

// 7. Update Existing Staff Member (Admin only)
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      employeeId,
      email,
      departmentId,
      department,
      roleTitle,
      categoryResponsibility,
      campusZone,
      phone,
      status
    } = req.body;

    const existing = await db.findStaffById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (employeeId !== undefined) updates.employeeId = employeeId.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (departmentId !== undefined) {
      updates.departmentId = departmentId;
      const deptObj = await db.findDepartmentById(departmentId);
      if (deptObj) updates.department = deptObj.name;
    }
    if (department !== undefined) updates.department = department;
    if (roleTitle !== undefined) updates.roleTitle = roleTitle.trim();
    if (categoryResponsibility !== undefined) updates.categoryResponsibility = categoryResponsibility;
    if (campusZone !== undefined) updates.campusZone = campusZone.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (status !== undefined) updates.status = status;

    const updated = await db.updateStaff(id, updates);
    const { passwordHash, ...safeStaff } = updated;

    res.json({ message: 'Staff member profile updated.', staff: safeStaff });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update staff member.' });
  }
};

// 8. Replace Staff & Transfer Tickets Workflow (Admin only)
export const replaceAndTransferStaff = async (req, res) => {
  try {
    const oldStaffId = req.body.oldStaffId || req.body.departingStaffId;
    const newStaffId = req.body.newStaffId || req.body.replacementStaffId;
    const { complaintIds, reason, departureStatus } = req.body;

    if (!oldStaffId) {
      return res.status(400).json({ error: 'Departing staff member ID is required.' });
    }
    if (!newStaffId) {
      return res.status(400).json({ error: 'Replacement staff member ID is required.' });
    }

    const adminName = req.user?.name || 'Dean Sarah Jenkins';

    const result = await db.replaceStaffAndTransferComplaints({
      oldStaffId,
      newStaffId,
      complaintIds,
      reason: reason?.trim() || 'Staff replacement',
      departureStatus: departureStatus === 'inactive' ? 'inactive' : 'left_college',
      adminName
    });

    res.json({
      message: `Staff replacement complete: Transferred ${result.transferredCount} open complaint ticket(s) from ${result.oldStaff.name} to ${result.newStaff.name}.`,
      result
    });
  } catch (err) {
    console.error('replaceAndTransferStaff error:', err);
    res.status(400).json({ error: err.message || 'Failed to replace staff and transfer tickets.' });
  }
};

// 9. Safe Staff Deactivation (Admin only)
export const deactivateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const targetStatus = req.body.status === 'left_college' ? 'left_college' : 'inactive';
    const reason = req.body.reason || req.body.notes || '';
    const adminName = req.user?.name || 'Administrator';

    const staff = await db.deactivateStaff(id, targetStatus, reason, adminName);
    res.json({
      message: `Staff member ${staff.name} marked as ${targetStatus === 'left_college' ? 'Left College' : 'Inactive'}.`,
      staff
    });
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({
        error: err.message,
        openCount: err.openCount,
        openTickets: err.openTickets
      });
    }
    res.status(500).json({ error: err.message || 'Failed to deactivate staff member.' });
  }
};

// 10. Reactivate Staff (Admin only)
export const reactivateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await db.reactivateStaff(id);
    res.json({
      message: `Staff member ${staff.name} has been reactivated.`,
      staff
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to reactivate staff member.' });
  }
};

// 11. Delete Staff (Legacy fallback)
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.findStaffById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    await db.deleteStaff(id);
    res.json({ message: `Staff member ${existing.name} deactivated and preserved in historical records.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete staff member.' });
  }
};
