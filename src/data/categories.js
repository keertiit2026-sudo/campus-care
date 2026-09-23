export const CATEGORIES = [
  {
    id: 'classroom_furniture',
    aliases: ['classroom'],
    name: 'Classroom & Furniture',
    icon: 'Armchair',
    color: '#6366f1',
    description: 'Desks, lecture chairs, podiums, whiteboards, smartboards, projectors, curtains',
    departmentId: 'civil'
  },
  {
    id: 'laboratory',
    name: 'Laboratory',
    icon: 'FlaskConical',
    color: '#a855f7',
    description: 'Lab instruments, test benches, safety hoods, power outlets, specimen refrigerators',
    departmentId: 'electrical'
  },
  {
    id: 'it_wifi',
    aliases: ['wifi_it'],
    name: 'IT & Wi-Fi',
    icon: 'Wifi',
    color: '#06b6d4',
    description: 'Campus internet outages, router coverage, portal login errors, lab computers, printer LAN',
    departmentId: 'it_services'
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: 'Zap',
    color: '#f59e0b',
    description: 'Power cuts, switchboards, lighting failures, ceiling fans, AC power, MCB tripping',
    departmentId: 'electrical'
  },
  {
    id: 'water_plumbing',
    name: 'Water & Plumbing',
    icon: 'Droplets',
    color: '#3b82f6',
    description: 'Drinking water coolers, pipe leaks, low pressure, tap damage, water tank filling',
    departmentId: 'civil'
  },
  {
    id: 'washroom_cleanliness',
    aliases: ['cleanliness'],
    name: 'Washroom & Cleanliness',
    icon: 'Sparkles',
    color: '#10b981',
    description: 'Restroom hygiene, sanitization, dustbins clearing, hallway mopping, odor control',
    departmentId: 'sanitation'
  },
  {
    id: 'hostel',
    name: 'Hostel',
    icon: 'Building2',
    color: '#ec4899',
    description: 'Hostel room fixtures, cupboard locks, geysers, mess food, laundry, corridor facilities',
    departmentId: 'hostel_admin'
  },
  {
    id: 'campus_grounds',
    aliases: ['infrastructure', 'transport'],
    name: 'Campus & Grounds',
    icon: 'Trees',
    color: '#14b8a6',
    description: 'Footpaths, sports grounds, parking areas, gardens, campus lighting, road maintenance',
    departmentId: 'civil'
  },
  {
    id: 'security_safety',
    name: 'Security & Safety',
    icon: 'ShieldAlert',
    color: '#ef4444',
    description: 'Main gate security, ID card checks, CCTV cameras, lost & found, emergency alarms',
    departmentId: 'hostel_admin'
  },
  {
    id: 'other',
    aliases: ['academics', 'library', 'food_canteen'],
    name: 'Other',
    icon: 'HelpCircle',
    color: '#8b5cf6',
    description: 'General inquiries, student welfare, miscellaneous administrative requests, other concerns',
    departmentId: 'academics'
  }
];

export const PRIORITIES = [
  { id: 'low', name: 'Low', color: '#10b981', bg: 'var(--priority-low-bg)', eta: '5-7 business days', desc: 'Minor inconvenience with no immediate academic impact' },
  { id: 'medium', name: 'Medium', color: '#3b82f6', bg: 'var(--priority-medium-bg)', eta: '3-4 business days', desc: 'Moderate issue affecting study or daily campus life' },
  { id: 'high', name: 'High', color: '#f59e0b', bg: 'var(--priority-high-bg)', eta: '24-48 hours', desc: 'Significant disruption to lecture, lab, or hostel amenities' },
  { id: 'urgent', name: 'Urgent', color: '#ef4444', bg: 'var(--priority-urgent-bg)', eta: 'Immediate / < 12 hrs', desc: 'Critical safety hazard, campus-wide outage, or exam blocker' }
];

export const STATUSES = [
  { id: 'Submitted', label: 'Submitted', color: 'var(--status-submitted)', step: 1, desc: 'Complaint registered by student' },
  { id: 'Under Review', label: 'Under Review', color: 'var(--status-under-review)', step: 2, desc: 'Admin evaluating severity and priority' },
  { id: 'Assigned', label: 'Assigned', color: 'var(--status-assigned)', step: 3, desc: 'Dispatched to specialized department and technician' },
  { id: 'In Progress', label: 'In Progress', color: 'var(--status-in-progress)', step: 4, desc: 'Staff currently fixing the reported issue' },
  { id: 'Resolved', label: 'Resolved', color: 'var(--status-resolved)', step: 5, desc: 'Work completed with resolution report' },
  { id: 'Closed', label: 'Closed', color: 'var(--status-closed)', step: 6, desc: 'Verified and closed by student/admin' }
];
