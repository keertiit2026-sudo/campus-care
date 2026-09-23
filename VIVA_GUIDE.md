# 🎓 CampusCare — Project Presentation & Viva Defense Guide

This document prepares you with key explanations, system concepts, and a structured live demonstration script for college project presentations, examiner reviews, and viva examinations.

---

## 🎯 1. Project Abstract & Motivation

### What is CampusCare?
**CampusCare** is a centralized, full-stack campus facility management and grievance redressal system. It replaces fragmented, manual, or paper-based campus complaint tracking with a transparent digital platform that features automated routing, SLA telemetry, and staff replacement workflows.

### Problem Statement:
* Traditional college complaint reporting lacks accountability, causes delayed responses for critical issues (e.g. lab Wi-Fi outages or hostel water leaks), and leaves students uninformed about progress.
* When campus technicians or maintenance staff leave or transition roles, open student complaints are often lost or abandoned.

### Solution:
* **Student Interface**: Geolocation-tagged complaint submission, real-time status tracking, and resolution satisfaction ratings.
* **Staff Console**: Quick triage, technician work queues, and resolution verification notes.
* **Admin Hub**: Automatic Smart AI classification, staff departure & ticket transfer safeguards, and dual-format executive audit reports (Excel & PDF).

---

## 💡 2. Top Viva Questions & Model Answers

### Q1: What is the tech stack and why did you choose it?
> **Answer**: 
> * **Frontend**: React 18 with Vite for ultra-fast compilation, modular component architecture, and responsive state management.
> * **Styling**: Tailored CSS design tokens with a modern **Light Pink + White** glassmorphism aesthetic (`#EC4899`, `#FFF7FB`, `#FFFFFF`).
> * **Backend**: Node.js and Express.js REST API providing secure JWT authentication and role-based access control.
> * **Storage**: Embedded persistent JSON document database engine ensuring fast read/write operations without heavy database server dependencies.

---

### Q2: How does the Smart AI Triage Engine work?
> **Answer**:
> The Smart AI Triage engine (`backend/src/services/complaintIntelligenceService.js`) analyzes incoming ticket descriptions using Natural Language keyword extraction and pattern recognition. It:
> 1. Detects signals corresponding to technical categories (e.g., "switch", "router", "dhcp" &rarr; `wifi_it`).
> 2. Evaluates urgency keywords (e.g., "sparking", "broken", "blocked", "exam") to dynamically set priority.
> 3. Recommends the corresponding department and available staff member with confidence scoring.

---

### Q3: How is data consistency maintained when a technician leaves the college?
> **Answer**:
> In [`storage.js`](file:///c:/Users/keert/Desktop/project%20folder/backend/src/db/storage.js), the `replaceStaffAndTransferComplaints` method executes an atomic reassignment:
> 1. It identifies all non-resolved tickets (`Submitted`, `Under Review`, `Assigned`, `In Progress`) assigned to the departing staff.
> 2. It reassigns those tickets to an active successor and records an audit log entry in each ticket's `statusHistory`.
> 3. It marks the departing staff member's status as `left_college` or `inactive` while preserving completed historical tickets for SLA accountability.

---

### Q4: How is security and role clearance handled?
> **Answer**:
> Authentication uses JSON Web Tokens (JWT) signed with a secret key. Password hashes are stored using **bcryptjs** (10 salt rounds). Client-side route protection is enforced using [`ProtectedRoute.jsx`](file:///c:/Users/keert/Desktop/project%20folder/src/components/auth/ProtectedRoute.jsx), and server-side route endpoints enforce role authorization through the `requireRole('admin', 'staff')` Express middleware.

---

## 🎬 3. Recommended 3-Minute Live Demo Flow

| Step | Persona | Action | What to Highlight |
| :---: | :---: | :--- | :--- |
| **1** | **Public** | Open Landing Page (`/welcome`) | Highlight clean, modern pink & white aesthetic, responsive navbar, and key features. |
| **2** | **Student** | Login as Priya Sharma (`priya.sharma@college.edu` / `student123`) | Show Student Dashboard, click **Raise Complaint**, demonstrate GPS auto-detection, and submit a ticket. |
| **3** | **Student** | Go to **My Tickets** (`/complaints/my`) | Show how student only sees their own 4 tickets, while campus hub shows all 12. |
| **4** | **Admin** | Switch to Admin Portal (`admin@college.edu` / `admin123`) | Show Admin Dashboard with SLA turnaround (14.8h), resolution rate (94%), and urgent alerts. |
| **5** | **Admin** | Open **Reports** & click **Export Analytics Report** | Demonstrate 1-click **Formatted Excel (.xls)** and **Executive PDF** with Dean signature line. |
| **6** | **Staff** | Login as Alex Chen (`alex.chen@college.edu` / `staff123`) | Mark ticket as **Resolved** with resolution notes, return to Student to demonstrate 5-star rating. |

---

## 🏆 Summary Checklist for Submission
- [x] Responsive Light Pink + White UI across all screen sizes.
- [x] Zero console runtime errors on all user flows.
- [x] Production build tested and verified (`npm run build`).
- [x] Clean documentation: [`README.md`](file:///c:/Users/keert/Desktop/project%20folder/README.md), [`DEPLOYMENT.md`](file:///c:/Users/keert/Desktop/project%20folder/DEPLOYMENT.md), and [`VIVA_GUIDE.md`](file:///c:/Users/keert/Desktop/project%20folder/VIVA_GUIDE.md).
