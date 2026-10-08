import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, isMongoConnected } from '../config/db.js';
import { User } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';
import { Department } from '../models/Department.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Creates a timestamped backup of db.json
 */
const createBackup = () => {
  if (!fs.existsSync(DB_FILE)) {
    throw new Error(`Source database file does not exist at ${DB_FILE}`);
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const backupPath = path.join(DATA_DIR, `db.backup-${timestamp}.json`);

  const originalContent = fs.readFileSync(DB_FILE, 'utf-8');
  fs.writeFileSync(backupPath, originalContent, 'utf-8');

  // Verify backup exists and is readable
  const readBack = fs.readFileSync(backupPath, 'utf-8');
  if (readBack.length !== originalContent.length) {
    throw new Error('Backup verification failed: File size mismatch.');
  }

  return { backupPath, backupSize: readBack.length };
};

/**
 * Main Migration Handler
 */
export const runMigration = async () => {
  console.log('========================================================');
  console.log('📦 CampusCare Database Migration to MongoDB Atlas');
  console.log('========================================================\n');

  // 1. Create Timestamped Backup
  console.log('1️⃣  Creating safe timestamped backup of db.json...');
  const { backupPath, backupSize } = createBackup();
  console.log(`✅ Backup created successfully:`);
  console.log(`   📁 Path: ${backupPath}`);
  console.log(`   📊 Size: ${backupSize} bytes\n`);

  // 2. Read and Parse Source db.json
  console.log('2️⃣  Reading and inspecting source data from db.json...');
  const rawData = fs.readFileSync(DB_FILE, 'utf-8');
  const sourceData = JSON.parse(rawData);

  const sourceUsers = sourceData.users || [];
  const sourceComplaints = sourceData.complaints || [];
  const sourceDepartments = sourceData.departments || [];

  console.log('--------------------------------------------------------');
  console.log('📋 Source db.json Records:');
  console.log(`   👥 Users:       ${sourceUsers.length}`);
  console.log(`   🎫 Complaints:  ${sourceComplaints.length}`);
  console.log(`   🏢 Departments: ${sourceDepartments.length}`);
  console.log('--------------------------------------------------------\n');

  // 3. Schema Pre-validation against Mongoose Models
  console.log('3️⃣  Pre-validating records against Mongoose schemas...');
  for (let i = 0; i < sourceUsers.length; i++) {
    const u = sourceUsers[i];
    const validationError = new User(u).validateSync();
    if (validationError) {
      throw new Error(`User validation error on record [${u.id || i}]: ${validationError.message}`);
    }
  }

  for (let i = 0; i < sourceComplaints.length; i++) {
    const c = sourceComplaints[i];
    const validationError = new Complaint(c).validateSync();
    if (validationError) {
      throw new Error(`Complaint validation error on record [${c.id || i}]: ${validationError.message}`);
    }
  }

  for (let i = 0; i < sourceDepartments.length; i++) {
    const d = sourceDepartments[i];
    const validationError = new Department(d).validateSync();
    if (validationError) {
      throw new Error(`Department validation error on record [${d.id || i}]: ${validationError.message}`);
    }
  }
  console.log('✅ All source records match Mongoose schemas perfectly (0 schema validation conflicts).\n');

  // 4. Connect to MongoDB
  console.log('4️⃣  Checking MongoDB connection...');
  const connected = await connectDB();

  if (!connected || !isMongoConnected()) {
    console.log('\n⚠️  [MIGRATION PAUSED]');
    console.log('MongoDB Atlas connection is not yet configured or reachable.');
    console.log('Please configure your MONGODB_URI in backend/.env:');
    console.log('MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/campuscare?retryWrites=true&w=majority\n');
    console.log('🛡️  Safety Status:');
    console.log('   • Backup created and verified.');
    console.log('   • Source db.json remains 100% intact and untouched.');
    console.log('   • App continues running seamlessly on local storage.');
    return {
      status: 'pending_uri',
      backupPath,
      sourceCounts: {
        users: sourceUsers.length,
        complaints: sourceComplaints.length,
        departments: sourceDepartments.length
      }
    };
  }

  // 5. Perform Idempotent Upsert Migration
  console.log('\n5️⃣  Executing idempotent migration into MongoDB Atlas...');

  // A. Migrate Users
  let usersMigrated = 0;
  for (const user of sourceUsers) {
    await User.findOneAndUpdate(
      { id: user.id },
      { $set: user },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    usersMigrated++;
  }
  console.log(`   ✅ Users migrated/upserted: ${usersMigrated}/${sourceUsers.length}`);

  // B. Migrate Departments
  let deptsMigrated = 0;
  for (const dept of sourceDepartments) {
    await Department.findOneAndUpdate(
      { id: dept.id },
      { $set: dept },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    deptsMigrated++;
  }
  console.log(`   ✅ Departments migrated/upserted: ${deptsMigrated}/${sourceDepartments.length}`);

  // C. Migrate Complaints
  let complaintsMigrated = 0;
  for (const comp of sourceComplaints) {
    await Complaint.findOneAndUpdate(
      { id: comp.id },
      { $set: comp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    complaintsMigrated++;
  }
  console.log(`   ✅ Complaints migrated/upserted: ${complaintsMigrated}/${sourceComplaints.length}\n`);

  // 6. Post-migration Count Verification
  console.log('6️⃣  Verifying record counts in MongoDB Atlas...');
  const mongoUsersCount = await User.countDocuments();
  const mongoComplaintsCount = await Complaint.countDocuments();
  const mongoDeptsCount = await Department.countDocuments();

  console.log('--------------------------------------------------------');
  console.log('📊 Post-Migration Verification Summary:');
  console.log(`   👥 Users:       db.json = ${sourceUsers.length} | MongoDB = ${mongoUsersCount}`);
  console.log(`   🎫 Complaints:  db.json = ${sourceComplaints.length} | MongoDB = ${mongoComplaintsCount}`);
  console.log(`   🏢 Departments: db.json = ${sourceDepartments.length} | MongoDB = ${mongoDeptsCount}`);
  console.log('--------------------------------------------------------\n');

  if (
    mongoUsersCount !== sourceUsers.length ||
    mongoComplaintsCount !== sourceComplaints.length ||
    mongoDeptsCount !== sourceDepartments.length
  ) {
    console.warn('⚠️  Count mismatch detected. Please check if existing records pre-existed in MongoDB Atlas.');
  } else {
    console.log('🎉 Count Check: 100% MATCH between db.json and MongoDB Atlas.\n');
  }

  // 7. Verify Sample Records from MongoDB
  console.log('7️⃣  Verifying sample records from MongoDB Atlas:');

  const sampleStudent = await User.findOne({ role: 'student' }).select('-passwordHash');
  const sampleStaff = await User.findOne({ role: 'staff' }).select('-passwordHash');
  const sampleAdmin = await User.findOne({ role: 'admin' }).select('-passwordHash');
  const sampleComplaint = await Complaint.findOne();
  const sampleDepartment = await Department.findOne();

  console.log(`   • Verified Student User: ${sampleStudent?.name} (ID: ${sampleStudent?.id}, StudentID: ${sampleStudent?.studentId})`);
  console.log(`   • Verified Staff User:   ${sampleStaff?.name} (ID: ${sampleStaff?.id}, Dept: ${sampleStaff?.department})`);
  console.log(`   • Verified Admin User:   ${sampleAdmin?.name} (ID: ${sampleAdmin?.id}, Role: ${sampleAdmin?.role})`);
  console.log(`   • Verified Complaint:    #${sampleComplaint?.id} - "${sampleComplaint?.title}" (Status: ${sampleComplaint?.status})`);
  console.log(`   • Verified Department:   ${sampleDepartment?.name} (ID: ${sampleDepartment?.id}, Code: ${sampleDepartment?.code})\n`);

  console.log('========================================================');
  console.log('✅ Migration completed successfully!');
  console.log('🔒 Note: backend/data/db.json is still the active application database.');
  console.log('========================================================');

  return {
    status: 'success',
    backupPath,
    sourceCounts: {
      users: sourceUsers.length,
      complaints: sourceComplaints.length,
      departments: sourceDepartments.length
    },
    mongoCounts: {
      users: mongoUsersCount,
      complaints: mongoComplaintsCount,
      departments: mongoDeptsCount
    }
  };
};

// Execute if run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Migration Failed:', err);
      mongoose.disconnect();
      process.exit(1);
    });
}
