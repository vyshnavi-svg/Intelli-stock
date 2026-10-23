import React from 'react';
import { ShoppingBag, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border)',
        padding: '40px 0 24px',
        marginTop: 'auto',
      }}
    >
      <div className="app-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '30px',
            marginBottom: '30px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <ShoppingBag size={18} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '16px' }}>
                Intelli<span style={{ color: 'var(--primary)' }}>Stock</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Full-Stack Multi-Vendor E-Commerce with Intelligent Stock Health Monitoring, automated low-stock detection, and reorder optimization.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Intelligent Engine</h4>
            <ul style={{ listStyle: 'none', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} color="#f59e0b" /> Real-time Stock Depletion Alerts</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><RefreshCw size={14} color="#2563eb" /> Automated Reorder Calculations</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={14} color="#10b981" /> Overstock & Out-of-Stock Prevention</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Demo Role Accounts</h4>
            <div style={{ fontSize: '12px', color: 'var(--secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>Admin:</strong> admin@ecommerce.com / admin123</div>
              <div><strong>Vendor:</strong> vendor@ecommerce.com / vendor123</div>
              <div><strong>Customer:</strong> customer@ecommerce.com / customer123</div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>© {new Date().getFullYear()} IntelliStock System. Built with MERN Stack (MongoDB, Express, React, Node.js).</div>
          <div>All API calculations synced live with backend database.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
