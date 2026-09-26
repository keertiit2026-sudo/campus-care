/**
 * Centralized Configuration for CampusCare Intelligence Module
 * All similarity, recurring windows, density levels, and campus landmark presets are configured here.
 */

export const INTELLIGENCE_CONFIG = {
  // Similarity Engine Thresholds
  SIMILARITY_THRESHOLD: 0.35, // 35% weighted threshold to flag possible duplicate complaints
  SIMILARITY_TIME_WINDOW_DAYS: 30, // 30-day window for similar complaints

  // Recurring Problem Engine Thresholds
  RECURRING_COMPLAINT_THRESHOLD: 2, // >=2 complaints in same zone to flag pattern
  RECURRING_PERIOD_DAYS: 30, // Rolling window for recurring issue detection

  // Density & Heatmap Hotspot Thresholds
  HIGH_DENSITY_THRESHOLD: 3, // >=3 active complaints in building = High density (Red)
  MEDIUM_DENSITY_THRESHOLD: 1, // 1-2 complaints = Medium density (Orange), 0 = Low (Green)

  // SLA Bottleneck Warning Threshold (Hours)
  SLA_DELAY_WARNING_HOURS: 24,

  // Campus Landmark Presets for Visual Heatmap & Building-Level Deep-Dive
  CAMPUS_BUILDINGS: [
    {
      id: 'bld_turing',
      name: 'Turing Block',
      code: 'TUR',
      type: 'Academic & Labs',
      description: 'Computer Science, AI Labs & Data Center',
      zones: ['Lab 304', 'Lab 201', 'Server Room', 'Faculty Annex'],
      icon: 'Terminal'
    },
    {
      id: 'bld_science',
      name: 'Science Block',
      code: 'SCI',
      type: 'Lecture Halls & Research',
      description: 'Physics, Chemistry, Electronics & Lecture Theaters',
      zones: ['Hall LH-201', 'Hall LH-102', 'Optics Lab', 'Chemistry Core'],
      icon: 'FlaskConical'
    },
    {
      id: 'bld_library',
      name: 'Central Library',
      code: 'LIB',
      type: 'Learning Resource Center',
      description: 'Main Library, Study Pods & Digital Archive',
      zones: ['3rd Floor Quiet Zone', 'Ground Reading Hall', 'Digital Media Lab'],
      icon: 'BookOpen'
    },
    {
      id: 'bld_hostel_gargi',
      name: 'Gargi Hall of Residence',
      code: 'GARGI',
      type: 'Residential Hostel',
      description: 'Student Residential Quarters & Dining Annex',
      zones: ['Wing B 2nd Floor', 'Wing A 1st Floor', 'Common Room', 'Dining Hall'],
      icon: 'Building2'
    },
    {
      id: 'bld_sac',
      name: 'Student Activity Center',
      code: 'SAC',
      type: 'Student Welfare & Dining',
      description: 'Food Court, Canteen, Clubs & Amphitheater',
      zones: ['Canteen Courtyard', 'Main Cafeteria', 'Club Hub', 'Sports Center'],
      icon: 'Utensils'
    },
    {
      id: 'bld_admin',
      name: 'Administrative Block',
      code: 'ADMIN',
      type: 'Administration & Registry',
      description: "Dean's Office, Registrar, Accounts & Student Welfare",
      zones: ['Suite 101', 'Main Reception', 'Boardroom', 'Accounts Hall'],
      icon: 'Building'
    },
    {
      id: 'bld_engineering',
      name: 'Engineering Annex',
      code: 'ENG',
      type: 'Workshops & Mechanical',
      description: 'Mechanical Workshops, Robotics & High-Voltage Labs',
      zones: ['Workshop Bay 2', 'Robotics Lab', 'Heavy Machinery Yard'],
      icon: 'Wrench'
    },
    {
      id: 'bld_transport',
      name: 'Campus Transport Yard',
      code: 'TRANS',
      type: 'Logistics & Fleet',
      description: 'Gate 3 Bus Terminus & Fleet Maintenance',
      zones: ['Gate 3 Terminus', 'Dispatch Depot', 'EV Charging Bay'],
      icon: 'Bus'
    }
  ]
};
