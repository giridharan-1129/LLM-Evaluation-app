import React from 'react';
import { useAppDispatch } from '../../../store';
import { useAuth } from '../../../store';
import { logout } from '../../../store/slices/authSlice';

/**
 * Header Component
 * Shows app title, user info, logout button
 */
const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header style={{ background: 'white', borderBottom: '1px solid #eee', padding: '1rem 2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#333' }}>
          LLM Evaluation Platform
        </h1>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ color: '#666', fontWeight: 500 }}>{user.name}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
