import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial college departments
const DEFAULT_DEPARTMENTS = [
  {
    id: 'it_services',
    name: 'IT Services & Network Infrastructure',
    code: 'ITS',
    head: 'Alex Chen',
    email: 'it-support@college.edu',
    phone: '+1 (555) 019-2831',
    slaHours: 24,
    staffCount: 6,
    location: 'Tech Hub Building, Room 201'
  },
  {
    id: 'electrical',
    name: 'Electrical & Power Systems',
    code: 'ELEC',
    head: 'Rajesh Kumar',
    email: 'electrical@college.edu',
    phone: '+1 (555) 019-2832',
    slaHours: 12,
    staffCount: 8,
    location: 'Engineering Annex, Ground Floor'
  },
  {
    id: 'civil',
    name: 'Civil Works & Estate Maintenance',
    code: 'CIVIL',
    head: 'Robert Miller',
    email: 'estate@college.edu',
    phone: '+1 (555) 019-2833',
    slaHours: 48,
    staffCount: 12,
    location: 'Facilities Workshop, Block E'
  },
  {
    id: 'hostel_admin',
    name: 'Hostel & Residential Life',
    code: 'HOSTEL',
    head: 'Sunita Rao',
    email: 'hostel-warden@college.edu',
    phone: '+1 (555) 019-2834',
    slaHours: 18,
    staffCount: 10,
    location: 'Hostel Administrative Office, Block A'
  },
  {
    id: 'sanitation',
    name: 'Sanitation & Housekeeping Services',
    code: 'SAN',
    head: 'Maria Gonzalez',
    email: 'housekeeping@college.edu',
    phone: '+1 (555) 019-2835',
    slaHours: 8,
    staffCount: 20,
    location: 'Central Stores & Services Unit'
  },
  {
    id: 'transport',
    name: 'Campus Transportation & Logistics',
    code: 'TRANS',
    head: 'David Kim',
    email: 'transport@college.edu',
    phone: '+1 (555) 019-2836',
    slaHours: 24,
    staffCount: 5,
    location: 'Campus Transport Yard, Gate 3'
  },
  {
    id: 'canteen',
    name: 'Food Safety & Canteen Committee',
    code: 'FOOD',
    head: 'Anita Desai',
    email: 'canteen-head@college.edu',
    phone: '+1 (555) 019-2837',
    slaHours: 12,
    staffCount: 4,
    location: 'Student Activity Center, Level 1'
  },
  {
    id: 'library',
    name: 'Central Library Management',
    code: 'LIB',
    head: 'Dr. James Wright',
    email: 'library-helpdesk@college.edu',
    phone: '+1 (555) 019-2838',
    slaHours: 24,
    staffCount: 7,
    location: 'Central Library, Main Floor'
  },
  {
    id: 'academics',
    name: 'Academic Affairs & Registry',
    code: 'ACAD',
    head: 'Prof. Evelyn Reed',
    email: 'academic-dean@college.edu',
    phone: '+1 (555) 019-2839',
    slaHours: 48,
    staffCount: 9,
    location: 'Administrative Block, Suite 101'
  }
];

class Database {
  constructor() {
    this.data = {
      users: [],
      complaints: [],
      departments: DEFAULT_DEPARTMENTS
    };
    this.init();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.ensureStandardStaffAndStatuses();
      } catch (e) {
        console.error('Error reading db.json, re-initializing default schema:', e.message);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  ensureStandardStaffAndStatuses() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('staff123', salt);

    const standardStaff = [
      {
        id: 'usr_staff_1',
        name: 'Alex Chen',
        employeeId: 'EMP-2024-001',
        email: 'alex.chen@college.edu',
        passwordHash: defaultPasswordHash,
        role: 'staff',
        status: 'active',
        departmentId: 'it_services',
        department: 'IT Services & Network Infrastructure',
        roleTitle: 'IT Infrastructure Lead',
        categoryResponsibility: 'wifi_it',
        campusZone: 'Tech Hub & Science Block',
        phone: '+1 (555) 019-2831',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2025-08-01T09:00:00.000Z',
        createdAt: '2025-08-01T09:00:00.000Z'
      },
      {
        id: 'usr_staff_2',
        name: 'Devin Thorne',
        employeeId: 'EMP-2024-002',
        email: 'devin.thorne@college.edu',
        passwordHash: defaultPasswordHash,
        role: 'staff',
        status: 'active',
        departmentId: 'it_services',
        department: 'IT Services & Network Infrastructure',
        roleTitle: 'Network Systems Admin',
        categoryResponsibility: 'wifi_it',
        campusZone: 'Main Administrative Block',
        phone: '+1 (555) 019-2832',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2025-09-15T09:00:00.000Z',
        createdAt: '2025-09-15T09:00:00.000Z'
      },
      {
        id: 'usr_staff_3',
        name: 'Rajesh Kumar',
        employeeId: 'EMP-2024-003',
        email: 'rajesh.kumar@college.edu',
        passwordHash: defaultPasswordHash,
        role: 'staff',
        status: 'active',
        departmentId: 'electrical',
        department: 'Electrical & Power Systems',
        roleTitle: 'Chief Electrical Supervisor',
        categoryResponsibility: 'electrical',
        campusZone: 'All Campus Zones & Substations',
        phone: '+1 (555) 019-2833',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2024-05-10T09:00:00.000Z',
        createdAt: '2024-05-10T09:00:00.000Z'
      },
      {
        id: 'usr_staff_4',
        name: 'Siddharth Nair',
        employeeId: 'EMP-2024-004',
        email: 'siddharth.nair@college.edu',
        passwordHash: defaultPasswordHash,
        role: 'staff',
        status: 'active',
        departmentId: 'electrical',
        department: 'Electrical & Power Systems',
        roleTitle: 'HVAC & Lighting Tech',
        categoryResponsibility: 'electrical',
        campusZone: 'Hostels & Academic Complex',
        phone: '+1 (555) 019-2834',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2025-01-20T09:00:00.000Z',
        createdAt: '2025-01-20T09:00:00.000Z'
      },
      {
        id: 'usr_staff_5',
        name: 'Robert Miller',
        employeeId: 'EMP-2024-005',
        email: 'robert.miller@college.edu',
        passwordHash: defaultPasswordHash,
        role: 'staff',
        status: 'active',
        departmentId: 'civil',
        department: 'Civil Works & Estate Maintenance',
        roleTitle: 'Senior Civil Engineer',
        categoryResponsibility: 'civil',
        campusZone: 'Classrooms & Academic Blocks',
        phone: '+1 (555) 019-2835',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2024-03-12T09:00:00.000Z',
        createdAt: '2024-03-12T09:00:00.000Z'
      },
      {
        id: 'usr_staff_6',
        name: 'Sunita Rao',
        employeeId: 'EMP-2024-006',
        email: 'sunita.rao@college.edu',
        passwordHash: defaultPasswordHash,
        role: 'staff',
        status: 'active',
        departmentId: 'hostel_admin',
        department: 'Hostel & Residential Life',
        roleTitle: 'Hostel Chief Superintendent',
        categoryResponsibility: 'hostel',
        campusZone: 'Gargi & Tagore Halls of Residence',
        phone: '+1 (555) 019-2836',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2024-07-01T09:00:00.000Z',
        createdAt: '2024-07-01T09:00:00.000Z'
      },
      {
        id: 'usr_staff_7',
        name: 'Maria Gonzalez',
        employeeId: 'EMP-2024-007',
        email: 'maria.gonzalez@college.edu',
        passwordHash: defaultPasswordHash,
        role: 'staff',
        status: 'active',
        departmentId: 'sanitation',
        department: 'Sanitation & Housekeeping Services',
        roleTitle: 'Hygiene & Cleanliness Head',
        categoryResponsibility: 'sanitation',
        campusZone: 'All Campus Buildings & Grounds',
        phone: '+1 (555) 019-2837',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2024-11-15T09:00:00.000Z',
        createdAt: '2024-11-15T09:00:00.000Z'
      },
      {
        id: 'usr_staff_8',
        name: 'David Kim',
        employeeId: 'EMP-2024-008',
        email: 'david.kim@college.edu',
        passwordHash: defaultPasswordHash,
        role: 'staff',
        status: 'active',
        departmentId: 'transport',
        department: 'Campus Transportation & Logistics',
        roleTitle: 'Fleet & Dispatch Officer',
        categoryResponsibility: 'transport',
        campusZone: 'Campus Bus Depot & Parking Lots',
        phone: '+1 (555) 019-2838',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2025-02-01T09:00:00.000Z',
        createdAt: '2025-02-01T09:00:00.000Z'
      }
    ];

    let hasChanges = false;

    // Ensure status and metadata on existing users
    this.data.users.forEach(u => {
      if (u.role === 'staff') {
        if (!u.status) {
          u.status = 'active';
          hasChanges = true;
        }
        if (!u.employeeId || u.employeeId.length > 14) {
          const suffix = u.id.startsWith('usr_staff_') && !isNaN(u.id.replace('usr_staff_', '')) && u.id.replace('usr_staff_', '').length < 4
            ? `00${u.id.replace('usr_staff_', '')}`
            : u.id.slice(-4);
          u.employeeId = `EMP-2024-${suffix}`;
          hasChanges = true;
        }
        if (!u.categoryResponsibility) {
          u.categoryResponsibility = 'general';
          hasChanges = true;
        }
        if (!u.campusZone) {
          u.campusZone = 'Main Campus';
          hasChanges = true;
        }
      }
    });

    // Ensure all standard staff are present
    standardStaff.forEach(std => {
      const existing = this.data.users.find(u => u.id === std.id || u.email === std.email);
      if (!existing) {
        this.data.users.push(std);
        hasChanges = true;
      } else {
        if (!existing.status) {
          existing.status = 'active';
          hasChanges = true;
        }
        if (!existing.employeeId) {
          existing.employeeId = std.employeeId;
          hasChanges = true;
        }
        if (!existing.categoryResponsibility) {
          existing.categoryResponsibility = std.categoryResponsibility;
          hasChanges = true;
        }
        if (!existing.campusZone) {
          existing.campusZone = std.campusZone;
          hasChanges = true;
        }
        if (!existing.roleTitle) {
          existing.roleTitle = std.roleTitle;
          hasChanges = true;
        }
        if (!existing.departmentId) {
          existing.departmentId = std.departmentId;
          hasChanges = true;
        }
        if (!existing.joinedAt) {
          existing.joinedAt = std.joinedAt;
          hasChanges = true;
        }
      }
    });

    // Ensure we have test complaints for Alex Chen (usr_staff_1) matching scenario
    const alexComplaints = this.data.complaints.filter(c => c.assignedStaff === 'usr_staff_1');
    if (alexComplaints.length < 4) {
      const sampleAlexComplaints = [
        {
          id: 'CMP-2026-1024',
          title: 'Wi-Fi problem in Lab 204',
          description: 'Terminals 12 to 24 cannot authenticate with the campus RADIUS access point. Error: DHCP lease timeout.',
          category: 'wifi_it',
          priority: 'high',
          status: 'In Progress',
          location: 'Tech Hub Building → 2nd Floor → Lab 204',
          student: {
            id: 'usr_student_1',
            name: 'Priya Sharma',
            studentId: 'STU-2024-8841',
            email: 'priya.sharma@college.edu',
            department: 'Computer Science & Engineering',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          },
          createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
          assignedDepartment: 'it_services',
          assignedStaff: 'usr_staff_1',
          attachments: [],
          statusHistory: [
            { id: 'sh-1024-1', fromStatus: null, toStatus: 'Submitted', changedBy: 'Priya Sharma (student)', timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), note: 'Complaint registered by student' },
            { id: 'sh-1024-2', fromStatus: 'Submitted', toStatus: 'In Progress', changedBy: 'Alex Chen (staff)', timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), note: 'Technician on-site testing switch port & replacing PoE injector' }
          ],
          comments: [],
          resolutionNotes: null,
          resolutionPhoto: null,
          resolvedAt: null,
          rating: null,
          feedback: null
        },
        {
          id: 'CMP-2026-1031',
          title: 'Network issue in Main Building',
          description: 'Ethernet drop in Seminar Hall B is intermittent. Presentation computers dropping connection during conference.',
          category: 'wifi_it',
          priority: 'medium',
          status: 'Assigned',
          location: 'Main Building → Ground Floor → Seminar Hall B',
          student: {
            id: 'usr_student_3',
            name: 'Ananya Patel',
            studentId: 'STU-2024-4421',
            email: 'ananya.patel@college.edu',
            department: 'Electrical Engineering',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          },
          createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          assignedDepartment: 'it_services',
          assignedStaff: 'usr_staff_1',
          attachments: [],
          statusHistory: [
            { id: 'sh-1031-1', fromStatus: null, toStatus: 'Submitted', changedBy: 'Ananya Patel (student)', timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), note: 'Complaint registered by student' },
            { id: 'sh-1031-2', fromStatus: 'Submitted', toStatus: 'Assigned', changedBy: 'Dean Sarah Jenkins (admin)', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Assigned to IT Infrastructure Lead Alex Chen' }
          ],
          comments: [],
          resolutionNotes: null,
          resolutionPhoto: null,
          resolvedAt: null,
          rating: null,
          feedback: null
        },
        {
          id: 'CMP-2026-1038',
          title: 'Internet problem in Lab 202',
          description: 'Core switch stack throwing packet loss alarms on VLAN 40. High latency reported by research scholars.',
          category: 'wifi_it',
          priority: 'high',
          status: 'Under Review',
          location: 'Tech Hub Building → 2nd Floor → Lab 202',
          student: {
            id: 'usr_student_2',
            name: 'Rahul Verma',
            studentId: 'STU-2024-9102',
            email: 'rahul.verma@college.edu',
            department: 'Mechanical Engineering',
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
          },
          createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
          assignedDepartment: 'it_services',
          assignedStaff: 'usr_staff_1',
          attachments: [],
          statusHistory: [
            { id: 'sh-1038-1', fromStatus: null, toStatus: 'Submitted', changedBy: 'Rahul Verma (student)', timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), note: 'Complaint registered by student' },
            { id: 'sh-1038-2', fromStatus: 'Submitted', toStatus: 'Under Review', changedBy: 'Dean Sarah Jenkins (admin)', timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), note: 'Reviewing switch redundancy' }
          ],
          comments: [],
          resolutionNotes: null,
          resolutionPhoto: null,
          resolvedAt: null,
          rating: null,
          feedback: null
        },
        {
          id: 'CMP-2026-1041',
          title: 'Router issue in Faculty Block C',
          description: 'Access Point AP-FB-C1 is broadcasting no signal after power surge.',
          category: 'wifi_it',
          priority: 'medium',
          status: 'Assigned',
          location: 'Faculty Block C → 1st Floor → Corridor AP',
          student: {
            id: 'usr_student_1',
            name: 'Priya Sharma',
            studentId: 'STU-2024-8841',
            email: 'priya.sharma@college.edu',
            department: 'Computer Science & Engineering',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          },
          createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          assignedDepartment: 'it_services',
          assignedStaff: 'usr_staff_1',
          attachments: [],
          statusHistory: [
            { id: 'sh-1041-1', fromStatus: null, toStatus: 'Submitted', changedBy: 'Priya Sharma (student)', timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), note: 'Complaint registered by student' },
            { id: 'sh-1041-2', fromStatus: 'Submitted', toStatus: 'Assigned', changedBy: 'Dean Sarah Jenkins (admin)', timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), note: 'Assigned to Alex Chen' }
          ],
          comments: [],
          resolutionNotes: null,
          resolutionPhoto: null,
          resolvedAt: null,
          rating: null,
          feedback: null
        },
        {
          id: 'CMP-2026-1011',
          title: 'Server Room UPS Alarm Beeping',
          description: 'Secondary battery string was triggering voltage threshold buzzer.',
          category: 'wifi_it',
          priority: 'urgent',
          status: 'Closed',
          location: 'Tech Hub Building → Basement → Main Server Room',
          student: {
            id: 'usr_student_4',
            name: 'Rohan Gupta',
            studentId: 'STU-2024-7719',
            email: 'rohan.gupta@college.edu',
            department: 'Civil Engineering',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
          },
          createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
          assignedDepartment: 'it_services',
          assignedStaff: 'usr_staff_1',
          attachments: [],
          statusHistory: [
            { id: 'sh-1011-1', fromStatus: null, toStatus: 'Submitted', changedBy: 'Rohan Gupta (student)', timestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(), note: 'Complaint registered' },
            { id: 'sh-1011-2', fromStatus: 'Submitted', toStatus: 'Resolved', changedBy: 'Alex Chen (staff)', timestamp: new Date(Date.now() - 13 * 24 * 3600 * 1000).toISOString(), note: 'Replaced lead acid battery module cell 4' },
            { id: 'sh-1011-3', fromStatus: 'Resolved', toStatus: 'Closed', changedBy: 'Dean Sarah Jenkins (admin)', timestamp: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(), note: 'Verified by facility management' }
          ],
          comments: [],
          resolutionNotes: 'Replaced lead acid battery module cell 4 and load tested to 45kW successfully.',
          resolutionPhoto: null,
          resolvedAt: new Date(Date.now() - 13 * 24 * 3600 * 1000).toISOString(),
          rating: 5,
          feedback: 'Fast response to critical infrastructure warning.'
        },
        {
          id: 'CMP-2026-1015',
          title: 'Optical Fiber Break on South Wing Link',
          description: 'Single-mode fiber patch cord damaged during HVAC duct maintenance.',
          category: 'wifi_it',
          priority: 'high',
          status: 'Resolved',
          location: 'South Academic Wing → 2nd Floor Distribution Riser',
          student: {
            id: 'usr_student_5',
            name: 'Sneha Reddy',
            studentId: 'STU-2024-3390',
            email: 'sneha.reddy@college.edu',
            department: 'Information Technology',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
          },
          createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
          assignedDepartment: 'it_services',
          assignedStaff: 'usr_staff_1',
          attachments: [],
          statusHistory: [
            { id: 'sh-1015-1', fromStatus: null, toStatus: 'Submitted', changedBy: 'Sneha Reddy (student)', timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), note: 'Registered' },
            { id: 'sh-1015-2', fromStatus: 'Submitted', toStatus: 'Resolved', changedBy: 'Alex Chen (staff)', timestamp: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(), note: 'Fusion spliced broken fiber core and verified 0.02dB loss' }
          ],
          comments: [],
          resolutionNotes: 'Fusion spliced broken fiber core and verified 0.02dB loss with OTDR meter.',
          resolutionPhoto: null,
          resolvedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
          rating: 5,
          feedback: 'Excellent technical work.'
        },
        {
          id: 'CMP-2026-1019',
          title: 'DNS Resolution Glitch on Campus Guest SSID',
          description: 'Captive portal redirection failing for visitor devices on 10.40.0.0/16 subnet.',
          category: 'wifi_it',
          priority: 'medium',
          status: 'Closed',
          location: 'Administrative Block → Visitor Lobby',
          student: {
            id: 'usr_student_5',
            name: 'Sneha Reddy',
            studentId: 'STU-2024-3390',
            email: 'sneha.reddy@college.edu',
            department: 'Information Technology',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
          },
          createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
          assignedDepartment: 'it_services',
          assignedStaff: 'usr_staff_1',
          attachments: [],
          statusHistory: [
            { id: 'sh-1019-1', fromStatus: null, toStatus: 'Submitted', changedBy: 'Sneha Reddy (student)', timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), note: 'Registered' },
            { id: 'sh-1019-2', fromStatus: 'Submitted', toStatus: 'Resolved', changedBy: 'Alex Chen (staff)', timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), note: 'Updated DNS forwarders and flushed BIND cache' },
            { id: 'sh-1019-3', fromStatus: 'Resolved', toStatus: 'Closed', changedBy: 'Dean Sarah Jenkins (admin)', timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), note: 'Closed' }
          ],
          comments: [],
          resolutionNotes: 'Updated DNS forwarders in firewall policy and flushed BIND cache on primary name server.',
          resolutionPhoto: null,
          resolvedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
          rating: 4,
          feedback: null
        }
      ];

      sampleAlexComplaints.forEach(sc => {
        if (!this.data.complaints.some(c => c.id === sc.id)) {
          this.data.complaints.unshift(sc);
          hasChanges = true;
        }
      });
    }

    if (hasChanges) {
      this.save();
    }
  }

  seedInitialData() {
    this.data = {
      users: [],
      complaints: [],
      departments: DEFAULT_DEPARTMENTS
    };
    this.ensureStandardStaffAndStatuses();
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save db.json:', e);
    }
  }

  // --- Users Methods ---
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserByIdentifier(identifier) {
    if (!identifier) return null;
    const lower = identifier.toLowerCase().trim();
    return this.data.users.find(u => 
      (u.email && u.email.toLowerCase() === lower) ||
      (u.studentId && u.studentId.toLowerCase() === lower)
    );
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData) {
    this.data.users.push(userData);
    this.save();
    return userData;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.users[idx];
  }

  getStaffMembers(statusFilter = 'active') {
    let staff = this.data.users.filter(u => u.role === 'staff');
    if (statusFilter === 'all') {
      return staff;
    }
    const filter = statusFilter || 'active';
    return staff.filter(u => (u.status || 'active') === filter);
  }

  getStaff(statusFilter = 'active') {
    return this.getStaffMembers(statusFilter);
  }

  findStaffById(id) {
    return this.data.users.find(u => u.id === id && u.role === 'staff');
  }

  // --- Complaints Methods ---
  getComplaints() {
    return this.data.complaints;
  }

  findComplaintById(id) {
    return this.data.complaints.find(c => c.id === id);
  }

  createComplaint(complaintData) {
    this.data.complaints.unshift(complaintData);
    this.save();
    return complaintData;
  }

  updateComplaint(id, updates) {
    const idx = this.data.complaints.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.complaints[idx] = {
      ...this.data.complaints[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.complaints[idx];
  }

  // --- Departments Methods ---
  getDepartments() {
    return this.data.departments;
  }

  findDepartmentById(id) {
    return this.data.departments.find(d => d.id === id);
  }

  updateDepartment(id, updates) {
    const idx = this.data.departments.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.data.departments[idx] = {
      ...this.data.departments[idx],
      ...updates
    };
    this.save();
    return this.data.departments[idx];
  }

  // --- Staff Operations & Ticket Reassignments ---
  updateStaff(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id && u.role === 'staff');
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates
    };
    this.save();
    return this.data.users[idx];
  }

  deleteStaff(id) {
    const idx = this.data.users.findIndex(u => u.id === id && u.role === 'staff');
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.save();
    return true;
  }

  findStaffOpenTickets(staffId) {
    if (!staffId) return [];
    return this.data.complaints.filter(
      c => c.assignedStaff === staffId && c.status !== 'Resolved' && c.status !== 'Closed'
    );
  }

  findStaffResolvedTickets(staffId) {
    if (!staffId) return [];
    return this.data.complaints.filter(
      c => c.assignedStaff === staffId && (c.status === 'Resolved' || c.status === 'Closed')
    );
  }

  /**
   * Replace Staff & Transfer Open Complaints safely
   */
  replaceStaffAndTransferComplaints({ oldStaffId, newStaffId, complaintIds = null, reason = 'Staff replacement', departureStatus = 'left_college', adminName = 'Administrator' }) {
    const oldStaff = this.findStaffById(oldStaffId);
    if (!oldStaff) {
      throw new Error(`Original staff member with ID ${oldStaffId} was not found.`);
    }

    const newStaff = this.findStaffById(newStaffId);
    if (!newStaff) {
      throw new Error(`Replacement staff member with ID ${newStaffId} was not found.`);
    }

    if (newStaff.id === oldStaff.id) {
      throw new Error('Replacement staff member cannot be the same as the departing staff member.');
    }

    if (newStaff.status !== 'active') {
      throw new Error(`Replacement staff member ${newStaff.name} is not active (${newStaff.status}) and cannot accept complaint assignments.`);
    }

    // Find eligible open complaints
    const allOpenComplaints = this.data.complaints.filter(
      c => c.assignedStaff === oldStaffId && c.status !== 'Resolved' && c.status !== 'Closed'
    );

    // Filter target complaints to transfer
    let targetComplaints = [];
    if (Array.isArray(complaintIds) && complaintIds.length > 0) {
      const idSet = new Set(complaintIds);
      targetComplaints = allOpenComplaints.filter(c => idSet.has(c.id));
    } else {
      // Default: transfer all eligible open complaints
      targetComplaints = allOpenComplaints;
    }

    const now = new Date().toISOString();
    const formattedDate = new Date().toLocaleString();
    const transferredSummary = [];

    // Transfer each eligible open complaint
    targetComplaints.forEach(c => {
      c.assignedStaff = newStaff.id;
      if (newStaff.departmentId) {
        c.assignedDepartment = newStaff.departmentId;
      }
      c.updatedAt = now;

      if (!c.statusHistory) c.statusHistory = [];
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

      c.statusHistory.push(auditEntry);
      transferredSummary.push({
        id: c.id,
        title: c.title,
        status: c.status,
        priority: c.priority
      });
    });

    // Mark old staff with designated departure status (preserves data for audit/history)
    oldStaff.status = departureStatus === 'inactive' ? 'inactive' : 'left_college';
    oldStaff.leftAt = now;
    oldStaff.resignationReason = reason;

    // Save changes
    this.save();

    return {
      success: true,
      transferredCount: targetComplaints.length,
      transferredComplaints: transferredSummary,
      oldStaff: {
        id: oldStaff.id,
        name: oldStaff.name,
        status: oldStaff.status,
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
   * Deactivate staff safely (blocks if open tickets exist unless forced/transferred)
   */
  deactivateStaff(staffId, targetStatus = 'inactive', reason = '', adminName = 'Administrator') {
    const staff = this.findStaffById(staffId);
    if (!staff) {
      throw new Error(`Staff member with ID ${staffId} not found.`);
    }

    const openTickets = this.findStaffOpenTickets(staffId);
    if (openTickets.length > 0) {
      const error = new Error(`Cannot mark as ${targetStatus === 'left_college' ? 'Left College' : 'Inactive'} yet. This staff member currently has ${openTickets.length} open complaint(s). Please transfer open complaints to another active staff member first.`);
      error.statusCode = 400;
      error.openCount = openTickets.length;
      error.openTickets = openTickets.map(t => ({ id: t.id, title: t.title, status: t.status, priority: t.priority }));
      throw error;
    }

    staff.status = targetStatus === 'left_college' ? 'left_college' : 'inactive';
    staff.leftAt = new Date().toISOString();
    if (reason) staff.resignationReason = reason;
    this.save();

    const { passwordHash: _, ...safeStaff } = staff;
    return safeStaff;
  }

  /**
   * Reactivate staff
   */
  reactivateStaff(staffId) {
    const staff = this.findStaffById(staffId);
    if (!staff) {
      throw new Error(`Staff member with ID ${staffId} not found.`);
    }

    staff.status = 'active';
    staff.leftAt = null;
    staff.resignationReason = null;
    this.save();

    const { passwordHash: _, ...safeStaff } = staff;
    return safeStaff;
  }
}

export const db = new Database();
