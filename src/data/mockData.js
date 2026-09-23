export const INITIAL_COMPLAINTS = [
  {
    id: 'CMP-2026-1081',
    title: 'High-speed Wi-Fi down across Computer Science Lab 3',
    description: 'During practical examinations, the main wireless access point AP-CS-302 completely dropped offline. Over 45 student terminals lost internet connectivity. SSID is broadcasting but fails authentication with DHCP timeout error.',
    category: 'wifi_it',
    priority: 'urgent',
    status: 'In Progress',
    location: 'Turing Block, 3rd Floor, Lab 304',
    student: {
      id: 'student_priya',
      name: 'Priya Sharma',
      studentId: 'STU-2024-8841',
      email: 'priya.sharma@campuscare.edu',
      department: 'Computer Science & Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-20T09:30:00.000Z',
    updatedAt: '2026-09-21T11:15:00.000Z',
    assignedDepartment: 'it_services',
    assignedStaff: 'staff_1', // Alex Chen
    attachments: [
      {
        id: 'att-1',
        name: 'router_error_display.jpg',
        url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
        size: '1.4 MB'
      }
    ],
    statusHistory: [
      { id: 'sh-1', fromStatus: null, toStatus: 'Submitted', changedBy: 'Priya Sharma (Student)', timestamp: '2026-09-20T09:30:00.000Z', note: 'Complaint submitted by student' },
      { id: 'sh-2', fromStatus: 'Submitted', toStatus: 'Under Review', changedBy: 'Dr. Sarah Jenkins (Admin)', timestamp: '2026-09-20T10:05:00.000Z', note: 'Triage reviewed - urgent priority confirmed due to ongoing practical exams' },
      { id: 'sh-3', fromStatus: 'Under Review', toStatus: 'Assigned', changedBy: 'Dr. Sarah Jenkins (Admin)', timestamp: '2026-09-20T10:20:00.000Z', note: 'Assigned to IT Services (Alex Chen)' },
      { id: 'sh-4', fromStatus: 'Assigned', toStatus: 'In Progress', changedBy: 'Alex Chen (IT Lead)', timestamp: '2026-09-20T11:45:00.000Z', note: 'Technician on-site testing switch port & replacing PoE injector' }
    ],
    comments: [
      {
        id: 'c-1',
        authorName: 'Alex Chen',
        authorRole: 'staff',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        timestamp: '2026-09-20T11:50:00.000Z',
        message: 'Identified a faulty PoE switch in rack CS-B. We are deploying a temporary 24-port Gigabit switch and re-flashing the AP firmware. Internet will be restored within 2 hours.',
        isInternal: false
      },
      {
        id: 'c-2',
        authorName: 'Priya Sharma',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        timestamp: '2026-09-20T12:10:00.000Z',
        message: 'Thank you Alex! Please let us know once the secondary AP is active so students can reconnect their test sessions.',
        isInternal: false
      }
    ],
    resolutionNotes: null,
    resolutionPhoto: null,
    resolvedAt: null,
    rating: null,
    feedback: null
  },
  {
    id: 'CMP-2026-1079',
    title: 'Ceiling projector lamp burnt out in Lecture Hall LH-201',
    description: 'The ceiling projector flickered and turned completely dark with an amber warning light during Professor Rao’s Physics lecture. Slide presentations cannot be conducted.',
    category: 'classroom',
    priority: 'high',
    status: 'Resolved',
    location: 'Science Block, 2nd Floor, Hall LH-201',
    student: {
      id: 'student_rahul',
      name: 'Rahul Verma',
      studentId: 'STU-2024-9102',
      email: 'rahul.verma@campuscare.edu',
      department: 'Mechanical Engineering',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-18T14:15:00.000Z',
    updatedAt: '2026-09-19T16:30:00.000Z',
    assignedDepartment: 'electrical',
    assignedStaff: 'staff_3', // Rajesh Kumar
    attachments: [
      {
        id: 'att-2',
        name: 'burnt_projector.jpg',
        url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
        size: '2.1 MB'
      }
    ],
    statusHistory: [
      { id: 'sh-201', fromStatus: null, toStatus: 'Submitted', changedBy: 'Rahul Verma (Student)', timestamp: '2026-09-18T14:15:00.000Z', note: 'Complaint submitted by student' },
      { id: 'sh-202', fromStatus: 'Submitted', toStatus: 'Assigned', changedBy: 'Dr. Sarah Jenkins (Admin)', timestamp: '2026-09-18T14:40:00.000Z', note: 'Assigned to Electrical Department' },
      { id: 'sh-203', fromStatus: 'Assigned', toStatus: 'In Progress', changedBy: 'Rajesh Kumar (Staff)', timestamp: '2026-09-19T10:00:00.000Z', note: 'Procured replacement 4500-lumen lamp bulb from central inventory' },
      { id: 'sh-204', fromStatus: 'In Progress', toStatus: 'Resolved', changedBy: 'Rajesh Kumar (Staff)', timestamp: '2026-09-19T16:30:00.000Z', note: 'Lamp module replaced, optical lens cleaned, HDMI calibrated.' }
    ],
    comments: [
      {
        id: 'c-201',
        authorName: 'Rajesh Kumar',
        authorRole: 'staff',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        timestamp: '2026-09-19T16:32:00.000Z',
        message: 'Replaced bulb with OEM part EPSON-ELPLP96. Tested color accuracy and resolution at 1080p 60Hz. Projection is crisp and functional.',
        isInternal: false
      }
    ],
    resolutionNotes: 'Successfully installed genuine replacement lamp module, cleaned dust filters, and verified video input from podium HDMI and wireless AirPlay.',
    resolutionPhoto: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    resolvedAt: '2026-09-19T16:30:00.000Z',
    rating: 5,
    feedback: 'Super fast turnaround! The lecture hall was ready before our next morning session. Excellent work.'
  },
  {
    id: 'CMP-2026-1077',
    title: 'Severe water pipe leakage in Gargi Hostel 2nd floor washroom',
    description: 'A major pipe joint under the third sink basin broke, causing continuous water flow across the corridor floor. Slipping hazard for all floor residents.',
    category: 'hostel',
    priority: 'urgent',
    status: 'In Progress',
    location: 'Gargi Hall of Residence, Wing B, 2nd Floor Washroom',
    student: {
      id: 'student_priya',
      name: 'Priya Sharma',
      studentId: 'STU-2024-8841',
      email: 'priya.sharma@campuscare.edu',
      department: 'Computer Science & Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-20T07:10:00.000Z',
    updatedAt: '2026-09-20T14:00:00.000Z',
    assignedDepartment: 'hostel_admin',
    assignedStaff: 'staff_6', // Sunita Rao
    attachments: [
      {
        id: 'att-3',
        name: 'water_leakage_corridor.jpg',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
        size: '3.2 MB'
      }
    ],
    statusHistory: [
      { id: 'sh-301', fromStatus: null, toStatus: 'Submitted', changedBy: 'Priya Sharma (Student)', timestamp: '2026-09-20T07:10:00.000Z', note: 'Emergency ticket registered' },
      { id: 'sh-302', fromStatus: 'Submitted', toStatus: 'Assigned', changedBy: 'Dr. Sarah Jenkins (Admin)', timestamp: '2026-09-20T07:30:00.000Z', note: 'Hostel Maintenance team alerted' },
      { id: 'sh-303', fromStatus: 'Assigned', toStatus: 'In Progress', changedBy: 'Sunita Rao (Hostel Supt)', timestamp: '2026-09-20T08:15:00.000Z', note: 'Main valve isolated, plumbers replacing PVC elbow joint' }
    ],
    comments: [
      {
        id: 'c-301',
        authorName: 'Sunita Rao',
        authorRole: 'staff',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        timestamp: '2026-09-20T08:20:00.000Z',
        message: 'Inlet control valve shut off to prevent water wastage. Housekeeping team dispatched for water mop-up. Replacement valve arriving by 2 PM.',
        isInternal: false
      }
    ],
    resolutionNotes: null,
    resolutionPhoto: null,
    resolvedAt: null,
    rating: null,
    feedback: null
  },
  {
    id: 'CMP-2026-1075',
    title: 'Central Library 3rd Floor HVAC unit producing rattling noise & no cooling',
    description: 'The air conditioning split system on the quiet study zone (3rd floor East wing) is blowing warm air and creating a 70dB metallic vibration that disrupts studying students.',
    category: 'library',
    priority: 'medium',
    status: 'Assigned',
    location: 'Central Library, 3rd Floor East Quiet Zone',
    student: {
      id: 'student_rahul',
      name: 'Rahul Verma',
      studentId: 'STU-2024-9102',
      email: 'rahul.verma@campuscare.edu',
      department: 'Mechanical Engineering',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-19T11:00:00.000Z',
    updatedAt: '2026-09-19T15:20:00.000Z',
    assignedDepartment: 'electrical',
    assignedStaff: 'staff_4', // Siddharth Nair
    attachments: [],
    statusHistory: [
      { id: 'sh-401', fromStatus: null, toStatus: 'Submitted', changedBy: 'Rahul Verma', timestamp: '2026-09-19T11:00:00.000Z', note: 'Submitted' },
      { id: 'sh-402', fromStatus: 'Submitted', toStatus: 'Under Review', changedBy: 'Dr. Sarah Jenkins', timestamp: '2026-09-19T14:10:00.000Z', note: 'Reviewed and categorized' },
      { id: 'sh-403', fromStatus: 'Under Review', toStatus: 'Assigned', changedBy: 'Dr. Sarah Jenkins', timestamp: '2026-09-19T15:20:00.000Z', note: 'Assigned to HVAC technician Siddharth Nair' }
    ],
    comments: [],
    resolutionNotes: null,
    resolutionPhoto: null,
    resolvedAt: null,
    rating: null,
    feedback: null
  },
  {
    id: 'CMP-2026-1072',
    title: 'Waste bins overflowing and unhygienic conditions behind Canteen Food Court',
    description: 'Organic waste disposal containers behind the cafeteria courtyard have not been cleared for 48 hours, attracting stray animals and creating unpleasant odors near the dining hall entrance.',
    category: 'cleanliness',
    priority: 'high',
    status: 'Under Review',
    location: 'Student Activity Center, Canteen Rear Courtyard',
    student: {
      id: 'student_priya',
      name: 'Priya Sharma',
      studentId: 'STU-2024-8841',
      email: 'priya.sharma@campuscare.edu',
      department: 'Computer Science & Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-21T08:00:00.000Z',
    updatedAt: '2026-09-21T08:45:00.000Z',
    assignedDepartment: 'sanitation',
    assignedStaff: null,
    attachments: [
      {
        id: 'att-4',
        name: 'canteen_bins.jpg',
        url: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&auto=format&fit=crop&q=80',
        size: '1.8 MB'
      }
    ],
    statusHistory: [
      { id: 'sh-501', fromStatus: null, toStatus: 'Submitted', changedBy: 'Priya Sharma', timestamp: '2026-09-21T08:00:00.000Z', note: 'Registered' },
      { id: 'sh-502', fromStatus: 'Submitted', toStatus: 'Under Review', changedBy: 'Dr. Sarah Jenkins', timestamp: '2026-09-21T08:45:00.000Z', note: 'Priority raised to High; contacting Sanitation Supervisor' }
    ],
    comments: [],
    resolutionNotes: null,
    resolutionPhoto: null,
    resolvedAt: null,
    rating: null,
    feedback: null
  },
  {
    id: 'CMP-2026-1070',
    title: 'Damaged stone steps & handrail at North Campus Library Entrance',
    description: 'Two steps on the entrance staircase have broken edges with loose tiles, and the metal railing is detached on the left side, presenting a trip risk during rainy weather.',
    category: 'infrastructure',
    priority: 'medium',
    status: 'Submitted',
    location: 'North Campus Library Main Portico',
    student: {
      id: 'student_rahul',
      name: 'Rahul Verma',
      studentId: 'STU-2024-9102',
      email: 'rahul.verma@campuscare.edu',
      department: 'Mechanical Engineering',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-21T10:15:00.000Z',
    updatedAt: '2026-09-21T10:15:00.000Z',
    assignedDepartment: 'civil',
    assignedStaff: null,
    attachments: [],
    statusHistory: [
      { id: 'sh-601', fromStatus: null, toStatus: 'Submitted', changedBy: 'Rahul Verma', timestamp: '2026-09-21T10:15:00.000Z', note: 'Submitted via student mobile portal' }
    ],
    comments: [],
    resolutionNotes: null,
    resolutionPhoto: null,
    resolvedAt: null,
    rating: null,
    feedback: null
  },
  {
    id: 'CMP-2026-1065',
    title: 'Morning Route Bus #12 arriving 35 minutes late for 3 consecutive days',
    description: 'The morning pickup bus on Route 12 (City Center to Campus via Metro Station) consistently arrives after 8:45 AM instead of the scheduled 8:15 AM, causing first period attendance penalties.',
    category: 'transport',
    priority: 'low',
    status: 'Closed',
    location: 'Campus Route 12 / Main Gate Terminus',
    student: {
      id: 'student_priya',
      name: 'Priya Sharma',
      studentId: 'STU-2024-8841',
      email: 'priya.sharma@campuscare.edu',
      department: 'Computer Science & Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    createdAt: '2026-09-15T09:00:00.000Z',
    updatedAt: '2026-09-17T17:00:00.000Z',
    assignedDepartment: 'transport',
    assignedStaff: 'staff_8', // David Kim
    attachments: [],
    statusHistory: [
      { id: 'sh-701', fromStatus: null, toStatus: 'Submitted', changedBy: 'Priya Sharma', timestamp: '2026-09-15T09:00:00.000Z', note: 'Complaint logged' },
      { id: 'sh-702', fromStatus: 'Submitted', toStatus: 'Assigned', changedBy: 'Dr. Sarah Jenkins', timestamp: '2026-09-15T11:00:00.000Z', note: 'Assigned to Transport Dept' },
      { id: 'sh-703', fromStatus: 'Assigned', toStatus: 'In Progress', changedBy: 'David Kim', timestamp: '2026-09-16T08:30:00.000Z', note: 'Investigating city road construction bottlenecks' },
      { id: 'sh-704', fromStatus: 'In Progress', toStatus: 'Resolved', changedBy: 'David Kim', timestamp: '2026-09-17T12:00:00.000Z', note: 'Route detour adjusted and departure shifted 15 mins earlier' },
      { id: 'sh-705', fromStatus: 'Resolved', toStatus: 'Closed', changedBy: 'Priya Sharma', timestamp: '2026-09-17T17:00:00.000Z', note: 'Bus arrived right on time at 8:15 AM today. Verified and closing.' }
    ],
    comments: [
      {
        id: 'c-701',
        authorName: 'David Kim',
        authorRole: 'staff',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        timestamp: '2026-09-17T11:55:00.000Z',
        message: 'We adjusted Route 12 to bypass the ongoing metro construction at 5th Cross. Bus 12 departure time from terminal is now updated in the official transport app.',
        isInternal: false
      }
    ],
    resolutionNotes: 'Updated Route 12 timetable with revised bypass road route. Driver briefed on punctual departure.',
    resolutionPhoto: null,
    resolvedAt: '2026-09-17T12:00:00.000Z',
    rating: 5,
    feedback: 'Appreciate the proactive solution and notifying all commuter students.'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Status Updated: CMP-2026-1081',
    message: 'Alex Chen updated Wi-Fi complaint to "In Progress". Work is on-site.',
    timestamp: '15 minutes ago',
    read: false,
    complaintId: 'CMP-2026-1081',
    type: 'status_update'
  },
  {
    id: 'notif-2',
    title: 'Resolution Completed: CMP-2026-1079',
    message: 'Projector lamp replacement in LH-201 marked as Resolved. Please provide feedback.',
    timestamp: '2 hours ago',
    read: false,
    complaintId: 'CMP-2026-1079',
    type: 'resolved'
  },
  {
    id: 'notif-3',
    title: 'Triage Assignment: CMP-2026-1077',
    message: 'Hostel water leakage assigned to Superintendent Sunita Rao with Urgent priority.',
    timestamp: '1 day ago',
    read: true,
    complaintId: 'CMP-2026-1077',
    type: 'assignment'
  }
];
