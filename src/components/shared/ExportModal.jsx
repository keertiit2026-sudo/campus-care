import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { 
  Download, FileSpreadsheet, Printer,
  Check, Filter, Calendar, Building, Sparkles, Shield
} from 'lucide-react';

const CATEGORY_NAMES = {
  wifi_it: 'IT Services & Wi-Fi',
  electrical: 'Electrical & Power Systems',
  hostel: 'Hostel & Residential Life',
  classroom: 'Classroom & Laboratory',
  cleanliness: 'Sanitation & Housekeeping',
  infrastructure: 'Civil & Infrastructure',
  transport: 'Campus Transport',
  canteen: 'Food Safety & Canteen',
  library: 'Central Library',
  academics: 'Academic Affairs'
};

const DEPT_NAMES = {
  it_services: 'IT Services & Network',
  electrical: 'Electrical & Power Systems',
  civil: 'Civil Works & Estate Maintenance',
  hostel_admin: 'Hostel & Residential Life',
  sanitation: 'Sanitation & Housekeeping',
  transport: 'Campus Transportation',
  canteen: 'Canteen & Food Services',
  library: 'Central Library Management',
  academics: 'Academic Affairs'
};

const formatDate = (isoString) => {
  if (!isoString || isoString === 'N/A') return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
};

export const ExportModal = () => {
  const { modalState, closeModal, complaints, addToast } = useApp();
  const { user } = useAuth();

  const [exportType, setExportType] = useState('excel'); // 'excel' | 'pdf'
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Filter complaints based on modal selections
  const filteredData = useMemo(() => {
    return complaints.filter(c => {
      const matchStatus = filterStatus === 'all' || c.status.toLowerCase() === filterStatus.toLowerCase();
      const matchCategory = filterCategory === 'all' || c.category === filterCategory;
      return matchStatus && matchCategory;
    });
  }, [complaints, filterStatus, filterCategory]);

  if (!modalState.isOpen || modalState.type !== 'export') {
    return null;
  }

  // 1. Export as Formatted Excel Workbook (.xls HTML Table)
  const handleExportExcel = () => {
    const title = `CampusCare_Official_Report_${new Date().toISOString().slice(0, 10)}`;
    
    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Campus Complaints</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          body { font-family: Calibri, Arial, sans-serif; }
          .header-title { font-size: 16pt; font-weight: bold; color: #1e293b; background-color: #f1f5f9; text-align: center; }
          .meta-info { font-size: 10pt; color: #64748b; }
          th { background-color: #4f46e5; color: #ffffff; font-weight: bold; text-align: left; padding: 10px; border: 1px solid #3730a3; font-size: 11pt; }
          td { padding: 8px; border: 1px solid #cbd5e1; font-size: 10pt; vertical-align: top; }
          .urgent { background-color: #fee2e2; color: #991b1b; font-weight: bold; }
          .resolved { background-color: #dcfce7; color: #166534; font-weight: bold; }
          .in-progress { background-color: #fef3c7; color: #92400e; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="11" class="header-title">CAMPUSCARE COMPLAINT MANAGEMENT SYSTEM - EXECUTIVE AUDIT REPORT</td>
          </tr>
          <tr>
            <td colspan="11" class="meta-info">Generated on: ${new Date().toLocaleString()} | Exported by: ${user?.name || 'Dean Sarah Jenkins'} (${user?.role || 'Administrator'}) | Total Records: ${filteredData.length}</td>
          </tr>
          <tr><td colspan="11"></td></tr>
          <tr>
            <th>Ticket ID</th>
            <th>Issue Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Current Status</th>
            <th>Campus Location</th>
            <th>Reported By</th>
            <th>Student Roll ID</th>
            <th>Assigned Department</th>
            <th>Date Logged</th>
            <th>Resolution Date / Notes</th>
          </tr>
    `;

    filteredData.forEach(c => {
      const catName = CATEGORY_NAMES[c.category] || c.category;
      const deptName = DEPT_NAMES[c.assignedDepartment] || c.assignedDepartment || 'Unassigned';
      const statusClass = c.status === 'Resolved' ? 'resolved' : c.priority === 'urgent' ? 'urgent' : 'in-progress';

      htmlContent += `
        <tr>
          <td style="font-weight: bold;">${c.id}</td>
          <td>${c.title}</td>
          <td>${catName}</td>
          <td class="${c.priority === 'urgent' ? 'urgent' : ''}">${c.priority.toUpperCase()}</td>
          <td class="${statusClass}">${c.status}</td>
          <td>${c.location}</td>
          <td>${c.student?.name || 'Anonymous Student'}</td>
          <td>${c.student?.studentId || 'N/A'}</td>
          <td>${deptName}</td>
          <td>${formatDate(c.createdAt)}</td>
          <td>${c.resolvedAt ? `${formatDate(c.resolvedAt)} - ${c.resolutionNotes || 'Resolved successfully'}` : 'Pending Resolution'}</td>
        </tr>
      `;
    });

    htmlContent += `
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Formatted Excel Exported',
      message: `Exported ${filteredData.length} structured records to formatted spreadsheet.`
    });
    closeModal();
  };

  // 2. Export as Formal Printable PDF Document (Clean Institutional Layout)
  const handlePrintFormalReport = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      addToast({ type: 'error', title: 'Popup Blocked', message: 'Please allow popups to generate the printable report.' });
      return;
    }

    const total = filteredData.length;
    const resolved = filteredData.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const urgent = filteredData.filter(c => c.priority === 'urgent').length;
    const inProgress = filteredData.filter(c => c.status === 'In Progress').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    let rowsHtml = '';
    filteredData.forEach((c) => {
      const catName = CATEGORY_NAMES[c.category] || c.category;
      const deptName = DEPT_NAMES[c.assignedDepartment] || c.assignedDepartment || 'General Pool';

      rowsHtml += `
        <tr>
          <td style="font-family: monospace; font-weight: bold; color: #4338ca;">${c.id}</td>
          <td>
            <div style="font-weight: bold; color: #1e293b; margin-bottom: 2px;">${c.title}</div>
            <div style="font-size: 11px; color: #64748b;">📍 ${c.location}</div>
          </td>
          <td><span class="badge badge-cat">${catName}</span></td>
          <td>
            <span class="badge ${c.priority === 'urgent' ? 'badge-urgent' : c.priority === 'high' ? 'badge-high' : 'badge-normal'}">
              ${c.priority.toUpperCase()}
            </span>
          </td>
          <td>
            <span class="badge ${c.status === 'Resolved' ? 'badge-resolved' : c.status === 'In Progress' ? 'badge-inprogress' : 'badge-submitted'}">
              ${c.status}
            </span>
          </td>
          <td>
            <div>${c.student?.name || 'Student'}</div>
            <div style="font-size: 11px; color: #64748b;">${c.student?.studentId || ''}</div>
          </td>
          <td style="font-size: 12px;">${deptName}</td>
          <td style="font-size: 11px; color: #475569;">${formatDate(c.createdAt)}</td>
        </tr>
      `;
    });

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CampusCare Complaint Audit Report</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 12px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; }
          .brand { display: flex; align-items: center; gap: 10px; }
          .brand-title { font-size: 20px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; }
          .brand-subtitle { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .meta { text-align: right; font-size: 11px; color: #64748b; }
          
          /* KPI Summary Cards */
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
          .stat-num { font-size: 22px; font-weight: 800; color: #1e293b; margin-top: 4px; }
          .stat-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
          
          /* Table Styles */
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: left; padding: 10px 8px; border-bottom: 2px solid #cbd5e1; }
          td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
          tr:nth-child(even) { background-color: #fafafa; }
          
          /* Badges */
          .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
          .badge-cat { background: #e0e7ff; color: #4338ca; }
          .badge-urgent { background: #fee2e2; color: #dc2626; }
          .badge-high { background: #ffedd5; color: #ea580c; }
          .badge-normal { background: #f1f5f9; color: #475569; }
          .badge-resolved { background: #dcfce7; color: #16a34a; }
          .badge-inprogress { background: #fef3c7; color: #d97706; }
          .badge-submitted { background: #e0f2fe; color: #0284c7; }
          
          /* Footer */
          .footer { margin-top: 30px; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; }
          .sign-line { margin-top: 40px; border-top: 1px dashed #cbd5e1; width: 220px; text-align: center; padding-top: 6px; font-size: 11px; color: #64748b; }
          
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <div>
              <div class="brand-title">CAMPUSCARE</div>
              <div class="brand-subtitle">Campus Grievance & SLA Operations Management</div>
            </div>
          </div>
          <div class="meta">
            <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div><strong>Generated By:</strong> ${user?.name || 'Administrator'} (${user?.role || 'Admin'})</div>
            <div><strong>Clearance:</strong> Institutional Audit Record</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Complaints</div>
            <div class="stat-num">${total}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Resolved / Closed</div>
            <div class="stat-num" style="color: #16a34a;">${resolved}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Urgent Alerts</div>
            <div class="stat-num" style="color: #dc2626;">${urgent}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Resolution Rate</div>
            <div class="stat-num" style="color: #4f46e5;">${resolutionRate}%</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 100px;">Ticket ID</th>
              <th>Issue Summary & Location</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Student</th>
              <th>Department</th>
              <th>Logged At</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-top: 30px;">
          <div class="sign-line">
            Dean / Authorized Officer Signature
          </div>
        </div>

        <div class="footer">
          <div>CampusCare Official Institutional Audit Report • Confidential</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();

    addToast({
      type: 'info',
      title: 'Formal Report Opened',
      message: 'Print preview dialog launched with executive layout.'
    });
    closeModal();
  };

  return (
    <Modal
      isOpen={modalState.isOpen && modalState.type === 'export'}
      onClose={closeModal}
      maxWidth="580px"
      title="Export Complaint Records"
      subtitle="Generate formatted Excel spreadsheets and executive PDF reports"
      icon={Download}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Filter Section */}
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', fontWeight: 700, color: 'var(--primary-300)' }}>
              <Filter size={14} />
              <span>Report Scope & Filters</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Matching Records: <strong style={{ color: 'var(--text-primary)' }}>{filteredData.length}</strong> of {complaints.length}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label" style={{ fontSize: '0.75rem' }}>Status Filter</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-control select-control"
                style={{ height: '38px', fontSize: '0.825rem' }}
              >
                <option value="all">All Statuses (Complete Archive)</option>
                <option value="Submitted">Submitted (New)</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned to Staff</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="input-label" style={{ fontSize: '0.75rem' }}>Category Filter</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-control select-control"
                style={{ height: '38px', fontSize: '0.825rem' }}
              >
                <option value="all">All Campus Categories</option>
                {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Export Format Selector (2 Clean Choices: Formatted Excel & Executive PDF) */}
        <div>
          <label className="input-label" style={{ marginBottom: '8px' }}>Select Output Format</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* 1. Formatted Excel */}
            <button
              type="button"
              onClick={() => setExportType('excel')}
              style={{
                padding: '18px 14px',
                borderRadius: '16px',
                border: exportType === 'excel' ? '2px solid #EC4899' : '1px solid rgba(249, 168, 212, 0.45)',
                backgroundColor: exportType === 'excel' ? '#FDF2F8' : '#ffffff',
                color: exportType === 'excel' ? '#EC4899' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                boxShadow: exportType === 'excel' ? '0 4px 15px rgba(236, 72, 153, 0.18)' : '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <FileSpreadsheet size={28} color={exportType === 'excel' ? '#EC4899' : '#64748B'} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E1B4B' }}>Formatted Excel</div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '3px' }}>Grid styling, status colors & dates (.xls)</div>
              </div>
            </button>

            {/* 2. Executive PDF / Print */}
            <button
              type="button"
              onClick={() => setExportType('pdf')}
              style={{
                padding: '18px 14px',
                borderRadius: '16px',
                border: exportType === 'pdf' ? '2px solid #EC4899' : '1px solid rgba(249, 168, 212, 0.45)',
                backgroundColor: exportType === 'pdf' ? '#FDF2F8' : '#ffffff',
                color: exportType === 'pdf' ? '#EC4899' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                boxShadow: exportType === 'pdf' ? '0 4px 15px rgba(236, 72, 153, 0.18)' : '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <Printer size={28} color={exportType === 'pdf' ? '#EC4899' : '#64748B'} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E1B4B' }}>Executive PDF</div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '3px' }}>College Header, KPIs & Signatures</div>
              </div>
            </button>
          </div>
        </div>

        {/* Format Explanation Hint */}
        <div style={{
          padding: '12px 14px',
          borderRadius: '12px',
          backgroundColor: '#FDF2F8',
          border: '1px dashed rgba(249, 168, 212, 0.7)',
          fontSize: '0.78rem',
          color: '#64748B',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={16} color="#EC4899" style={{ flexShrink: 0 }} />
          <span>
            {exportType === 'excel' && 'Generates an Excel spreadsheet with labeled headers, status colors, and readable dates.'}
            {exportType === 'pdf' && 'Generates a formal executive audit document with KPIs, college header, and signature line.'}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button type="button" onClick={closeModal} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (exportType === 'excel') handleExportExcel();
              else handlePrintFormalReport();
            }}
            className="btn btn-primary"
            style={{ gap: '6px' }}
          >
            <Download size={16} />
            <span>
              {exportType === 'excel' ? 'Download Excel Report (.xls)' : 'Generate & Print PDF'}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
