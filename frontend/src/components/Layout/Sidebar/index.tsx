import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUI } from '../../../store';

/**
 * Sidebar Component
 * Navigation menu with links to main sections
 */
const Sidebar: React.FC = () => {
  const { sidebarOpen } = useUI();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Projects', path: '/projects', icon: '📁' },
    { label: 'Prompts', path: '/prompts', icon: '📝' },
    { label: 'Jobs', path: '/jobs', icon: '⚙️' },
    { label: 'Metrics', path: '/metrics', icon: '📈' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      style={{
        width: '250px',
        background: 'white',
        borderRight: '1px solid #eee',
        overflowY: 'auto',
        transition: 'transform 0.3s',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}
    >
      <nav style={{ padding: '1rem 0' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 1.5rem',
                  color: isActive(item.path) ? '#667eea' : '#666',
                  textDecoration: 'none',
                  background: isActive(item.path) ? '#f0f0f0' : 'transparent',
                  borderLeft: isActive(item.path) ? '3px solid #667eea' : '3px solid transparent',
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
