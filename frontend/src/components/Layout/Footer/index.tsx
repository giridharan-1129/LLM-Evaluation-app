import React from 'react';

/**
 * Footer Component
 * Shows copyright, links, etc
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'white',
        borderTop: '1px solid #eee',
        padding: '1rem 2rem',
        fontSize: '0.875rem',
        color: '#666',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <p style={{ margin: 0 }}>
          &copy; {currentYear} LLM Evaluation Platform. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#667eea', textDecoration: 'none' }}
          >
            GitHub
          </a>
          <a
            href="https://docs.example.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#667eea', textDecoration: 'none' }}
          >
            Documentation
          </a>
          <a
            href="mailto:support@example.com"
            style={{ color: '#667eea', textDecoration: 'none' }}
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
