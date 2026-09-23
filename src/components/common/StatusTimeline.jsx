import React from 'react';
import { STATUSES } from '../../data/categories';
import { Check, Clock, AlertCircle } from 'lucide-react';

export const StatusTimeline = ({ currentStatus, statusHistory = [] }) => {
  const currentIndex = STATUSES.findIndex(
    s => s.id.toLowerCase() === (currentStatus || 'submitted').toLowerCase()
  );

  return (
    <div style={{ width: '100%', margin: '16px 0 24px 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '0 8px'
      }}>
        {/* Background connector bar */}
        <div style={{
          position: 'absolute',
          top: '18px',
          left: '32px',
          right: '32px',
          height: '3px',
          backgroundColor: 'var(--border-color)',
          zIndex: 1
        }}>
          <div
            style={{
              height: '100%',
              backgroundColor: 'var(--primary-500)',
              width: `${Math.max(0, (currentIndex / (STATUSES.length - 1)) * 100)}%`,
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        {STATUSES.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;

          // Find if there is a history record for this stage
          const historyEntry = statusHistory.find(
            h => (h.toStatus || '').toLowerCase() === step.id.toLowerCase()
          );

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2,
                flex: 1
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  backgroundColor: isPassed
                    ? 'var(--primary-500)'
                    : isCurrent
                    ? 'var(--bg-glass-solid)'
                    : 'var(--bg-tertiary)',
                  border: isCurrent
                    ? `3px solid ${step.color}`
                    : isPassed
                    ? 'none'
                    : '2px solid var(--border-color)',
                  color: isPassed
                    ? '#ffffff'
                    : isCurrent
                    ? step.color
                    : 'var(--text-muted)',
                  boxShadow: isCurrent ? `0 0 15px ${step.color}60` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {isPassed ? <Check size={18} strokeWidth={3} /> : idx + 1}
              </div>

              <div style={{
                marginTop: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent
                    ? step.color
                    : isPassed
                    ? 'var(--text-primary)'
                    : 'var(--text-muted)'
                }}>
                  {step.label}
                </div>
                {historyEntry && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {new Date(historyEntry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
