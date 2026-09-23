import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';
import { CATEGORIES } from '../../data/categories';
import { 
  Edit3, Mail, Phone, Building, Tag, 
  MapPin, Shield, CheckCircle2, AlertCircle, RefreshCw, Save 
} from 'lucide-react';

export const EditStaffModal = ({ isOpen, onClose, staff, departments = [], onStaffUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    departmentId: '',
    roleTitle: '',
    categoryResponsibility: 'general',
    campusZone: 'Main Campus',
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        employeeId: staff.employeeId || `EMP-${staff.id?.replace('usr_staff_', '2024-00') || '000'}`,
        email: staff.email || '',
        phone: staff.phone || '',
        departmentId: staff.departmentId || departments[0]?.id || 'it_services',
        roleTitle: staff.roleTitle || staff.role || 'Technician',
        categoryResponsibility: staff.categoryResponsibility || 'general',
        campusZone: staff.campusZone || 'Main Campus',
        status: staff.status || 'active'
      });
      setError('');
    }
  }, [staff, departments]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedDept = departments.find(d => d.id === formData.departmentId);
      const payload = {
        ...formData,
        name: formData.name.trim(),
        employeeId: formData.employeeId.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        department: selectedDept ? selectedDept.name : staff.department,
        roleTitle: formData.roleTitle.trim(),
        campusZone: formData.campusZone.trim()
      };

      const updated = await api.updateStaff(staff.id, payload);
      if (onStaffUpdated) {
        onStaffUpdated(updated);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update staff member profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Staff: ${staff?.name || 'Profile'}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {/* Full Name */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="input-control"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          {/* Employee ID */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Staff ID / Employee ID <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="input-control"
              value={formData.employeeId}
              onChange={(e) => handleChange('employeeId', e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              className="input-control"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Phone Number
            </label>
            <input
              type="text"
              className="input-control"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          {/* Department */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Department <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              className="input-control"
              value={formData.departmentId}
              onChange={(e) => handleChange('departmentId', e.target.value)}
              required
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Designation / Role Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="input-control"
              value={formData.roleTitle}
              onChange={(e) => handleChange('roleTitle', e.target.value)}
              required
            />
          </div>

          {/* Category Responsibility */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Category Responsibility
            </label>
            <select
              className="input-control"
              value={formData.categoryResponsibility}
              onChange={(e) => handleChange('categoryResponsibility', e.target.value)}
            >
              <option value="general">🌐 General / All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campus Zone */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Building / Campus Zone
            </label>
            <input
              type="text"
              className="input-control"
              value={formData.campusZone}
              onChange={(e) => handleChange('campusZone', e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Staff Status <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              className="input-control"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="active">🟢 Active (Accepts new tickets)</option>
              <option value="inactive">⚪ Inactive (Paused / On Leave)</option>
              <option value="left_college">🔴 Left College (Departed / Preserved History)</option>
            </select>
          </div>
        </div>

        <div style={{
          marginTop: '10px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ gap: '8px' }}
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
