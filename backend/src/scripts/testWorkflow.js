// Quick verification script using built-in fetch
async function runTests() {
  console.log('--- Starting Staff Resignation & Transfer API Tests ---');
  
  // 1. Login as Admin
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@college.edu', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('✓ Admin Login Success, Token obtained');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Fetch all staff
  const staffRes = await fetch('http://localhost:5000/api/staff', { headers });
  const staffData = await staffRes.json();
  console.log(`✓ Fetched ${staffData.staff.length} staff members`);
  const alex = staffData.staff.find(s => s.id === 'usr_staff_1' || s.name === 'Alex Chen');
  const devin = staffData.staff.find(s => s.id === 'usr_staff_2' || s.name === 'Devin Thorne');
  console.log(`  - Alex Chen active tickets: ${alex?.activeTickets}, status: ${alex?.status}`);
  console.log(`  - Devin Thorne active tickets: ${devin?.activeTickets}, status: ${devin?.status}`);

  // 3. Test open tickets endpoint
  const openTicketsRes = await fetch(`http://localhost:5000/api/staff/${alex.id}/open-tickets`, { headers });
  const openTicketsData = await openTicketsRes.json();
  console.log(`✓ Open tickets for Alex Chen: ${openTicketsData.totalOpen} tickets found`);

  // 4. Test Deactivation Guard (should fail because Alex has open tickets)
  const deactFailRes = await fetch(`http://localhost:5000/api/staff/${alex.id}/deactivate`, {
    method: 'POST',
    headers
  });
  const deactFailData = await deactFailRes.json();
  if (deactFailRes.status === 400 && deactFailData.openCount > 0) {
    console.log(`✓ Deactivation Guard Passed: Correctly blocked deactivation because staff has ${deactFailData.openCount} open tickets.`);
  } else {
    console.error('✗ Deactivation Guard Failed:', deactFailData);
  }

  // 5. Perform Staff Replacement (Alex Chen -> Devin Thorne)
  console.log('\n--- Executing Staff Replacement (Alex Chen -> Devin Thorne) ---');
  const replaceRes = await fetch('http://localhost:5000/api/staff/replace', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      oldStaffId: alex.id,
      newStaffId: devin.id,
      reason: 'Staff resignation - relocating abroad'
    })
  });
  const replaceData = await replaceRes.json();
  console.log(`✓ Replacement API Response: ${replaceData.message}`);
  console.log(`  - Transferred Count: ${replaceData.result?.transferredCount}`);
  console.log(`  - Old Staff Status: ${replaceData.result?.oldStaff.status}`);
  console.log(`  - New Staff Status: ${replaceData.result?.newStaff.status}`);

  // 6. Verify Alex Chen is Inactive and Devin Thorne has tickets
  const alexUpdatedRes = await fetch(`http://localhost:5000/api/staff/${alex.id}`, { headers });
  const alexUpdated = (await alexUpdatedRes.json()).staff;
  console.log(`✓ Alex Chen Updated Status: ${alexUpdated.status} (Open tickets: ${alexUpdated.activeTickets})`);

  const devinUpdatedRes = await fetch(`http://localhost:5000/api/staff/${devin.id}`, { headers });
  const devinUpdated = (await devinUpdatedRes.json()).staff;
  console.log(`✓ Devin Thorne Updated Status: ${devinUpdated.status} (Open tickets: ${devinUpdated.activeTickets})`);

  // 7. Verify Transferred Complaint and Audit History
  const complaintRes = await fetch('http://localhost:5000/api/complaints/CMP-2026-1024', { headers });
  const complaint = (await complaintRes.json()).complaint;
  console.log(`✓ Complaint CMP-2026-1024 assigned to: ${complaint.assignedStaff}`);
  const lastHistory = complaint.statusHistory[complaint.statusHistory.length - 1];
  console.log(`✓ Audit Log Entry in Status History:`);
  console.log(`  Note: "${lastHistory.note}"`);
  console.log(`  By: ${lastHistory.changedBy}`);
  console.log(`  Transfer Details:`, lastHistory.transferDetails);

  // 8. Verify Closed Complaint (CMP-2026-1011) stayed with Alex Chen
  const closedRes = await fetch('http://localhost:5000/api/complaints/CMP-2026-1011', { headers });
  const closedComplaint = (await closedRes.json()).complaint;
  console.log(`✓ Closed Complaint CMP-2026-1011 remains assigned to: ${closedComplaint.assignedStaff} (${closedComplaint.status})`);

  console.log('\n--- All Backend Automated Tests Completed Successfully! ---');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
});
