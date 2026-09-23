/**
 * Centralized Configuration for CampusCare Intelligence Module
 * All thresholds, rolling windows, and campus landmark presets are configured here.
 */

export const INTELLIGENCE_CONFIG = {
  // Similarity Engine Thresholds
  SIMILARITY_THRESHOLD: 0.40, // 40% similarity score threshold to flag possible duplicates
  SIMILARITY_TIME_WINDOW_DAYS: 30, // Look back period for similar complaints

  // Recurring Problem Engine Thresholds
  RECURRING_COMPLAINT_THRESHOLD: 2, // Minimum complaints in same room/building to flag pattern
  RECURRING_PERIOD_DAYS: 30, // Rolling window for recurring issue detection

  // Density & Heatmap Hotspot Thresholds
  HIGH_DENSITY_THRESHOLD: 3, // >= 3 complaints in building = High density (Red)
  MEDIUM_DENSITY_THRESHOLD: 1, // 1-2 complaints = Medium density (Orange), 0 = Low (Green)

  // SLA Bottleneck Warning Threshold (Hours)
  SLA_DELAY_WARNING_HOURS: 24,

  // Campus Landmark Presets for Visual Heatmap
  CAMPUS_BUILDINGS: [
    {
      id: 'bld_turing',
      name: 'Turing Block',
      code: 'TUR',
      type: 'Academic & Labs',
      description: 'Computer Science, AI Labs & Data Center',
      x: 25, // % position on visual campus map
      y: 28,
      lat: 28.6145,
      lng: 77.2085,
      zones: ['Lab 304', 'Lab 201', 'Server Room', 'Faculty Annex']
    },
    {
      id: 'bld_science',
      name: 'Science Block',
      code: 'SCI',
      type: 'Lecture Halls & Research',
      description: 'Physics, Chemistry, Electronics & Lecture Theaters',
      x: 68,
      y: 25,
      lat: 28.6148,
      lng: 77.2105,
      zones: ['Hall LH-201', 'Hall LH-102', 'Optics Lab', 'Chemistry Core']
    },
    {
      id: 'bld_library',
      name: 'Central Library',
      code: 'LIB',
      type: 'Learning Resource Center',
      description: 'Main Library, Study Pods & Digital Archive',
      x: 48,
      y: 45,
      lat: 28.6138,
      lng: 77.2095,
      zones: ['3rd Floor Quiet Zone', 'Ground Reading Hall', 'Digital Media Lab']
    },
    {
      id: 'bld_hostel_gargi',
      name: 'Gargi Hall of Residence',
      code: 'GARGI',
      type: 'Residential Hostel',
      description: 'Student Residential Quarters & Dining Annex',
      x: 20,
      y: 72,
      lat: 28.6125,
      lng: 77.2078,
      zones: ['Wing B 2nd Floor', 'Wing A 1st Floor', 'Common Room', 'Dining Hall']
    },
    {
      id: 'bld_sac',
      name: 'Student Activity Center',
      code: 'SAC',
      type: 'Student Welfare & Dining',
      description: 'Food Court, Canteen, Clubs & Amphitheater',
      x: 75,
      y: 70,
      lat: 28.6128,
      lng: 77.2115,
      zones: ['Canteen Courtyard', 'Main Cafeteria', 'Club Hub', 'Sports Center']
    },
    {
      id: 'bld_admin',
      name: 'Administrative Block',
      code: 'ADMIN',
      type: 'Administration & Registry',
      description: 'Deans Office, Registrar, Accounts & Student Welfare',
      x: 48,
      y: 15,
      lat: 28.6155,
      lng: 77.2095,
      zones: ['Suite 101', 'Main Reception', 'Boardroom', 'Accounts Hall']
    },
    {
      id: 'bld_engineering',
      name: 'Engineering Annex',
      code: 'ENG',
      type: 'Workshops & Mechanical',
      description: 'Electrical Substations, Civil Workshop & Heavy Machinery',
      x: 82,
      y: 42,
      lat: 28.6139,
      lng: 77.2120,
      zones: ['Substation B', 'Fluid Mechanics Lab', 'Fabrication Yard']
    },
    {
      id: 'bld_transport',
      name: 'Campus Transport Yard',
      code: 'TRANS',
      type: 'Logistics & Fleet',
      description: 'Gate 3 Bus Terminus & Fleet Maintenance',
      x: 15,
      y: 48,
      lat: 28.6135,
      lng: 77.2070,
      zones: ['Gate 3 Terminus', 'Dispatch Depot', 'EV Charging Bay']
    }
  ]
};
