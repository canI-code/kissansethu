import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ROLE_META = {
  farmer: { emoji: '🌾', label: 'Farmer', labelHi: 'किसान', color: '#2e7d32', bg: '#e8f5e9' },
  worker: { emoji: '👷', label: 'Worker', labelHi: 'मजदूर', color: '#e65100', bg: '#fff3e0' },
  equipment_owner: { emoji: '🚜', label: 'Equipment', labelHi: 'उपकरण मालिक', color: '#1565c0', bg: '#e3f2fd' },
};

/**
 * RoleSwitcher — compact chip in the header that shows the active role
 * and lets the user switch between their available roles.
 * Shows a toast-style snackbar on successful switch.
 */
const RoleSwitcher = () => {
  const { activeRole, allRoles, switchRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Don't render if user has only one role or no role
  if (!activeRole || allRoles.length <= 1) return null;

  const current = ROLE_META[activeRole] || { emoji: '👤', label: activeRole, color: '#555', bg: '#f5f5f5' };
  const otherRoles = allRoles.filter((r) => r !== activeRole);

  const handleSwitch = async (role) => {
    setOpen(false);
    setSwitching(true);
    const result = await switchRole(role);
    setSwitching(false);
    if (result.success) {
      const meta = ROLE_META[role] || { emoji: '👤', label: role };
      setToast(`${meta.emoji} Switched to ${meta.label} mode`);
    }
  };

  return (
    <>
      {/* Role chip trigger */}
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={switching}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '20px',
            border: `1.5px solid ${current.color}`,
            background: current.bg,
            color: current.color,
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
          title="Switch role"
        >
          <span>{current.emoji}</span>
          <span>{current.label}</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>▼</span>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              minWidth: '160px',
              zIndex: 1000,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px 12px 4px', fontSize: '0.7rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Switch to
            </div>
            {otherRoles.map((role) => {
              const meta = ROLE_META[role] || { emoji: '👤', label: role, color: '#555', bg: '#f5f5f5' };
              return (
                <button
                  key={role}
                  onClick={() => handleSwitch(role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: meta.color,
                    textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = meta.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '1.1rem' }}>{meta.emoji}</span>
                  <div>
                    <div>{meta.label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: 400 }}>{meta.labelHi}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast snackbar */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#323232',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '24px',
            fontSize: '0.9rem',
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
};

export default RoleSwitcher;
