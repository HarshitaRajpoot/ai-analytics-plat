import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, Settings, Brain, BarChart2, Users, ExternalLink } from 'lucide-react';

const TARGET_WEBSITE_URL = import.meta.env.VITE_TARGET_WEBSITE_URL || 'http://localhost:5500/target-website/index.html';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: LineChart },
    { name: 'AI Insights', path: '/insights', icon: Brain },
    { name: 'CRM / Admin', path: '/admin', icon: Users },
    { name: 'Reports', path: '/reports', icon: BarChart2 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <Brain size={24} color="#f8fafc" />
        </div>
        <span style={styles.logoText}>Sphere Global</span>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} color={isActive ? '#f8fafc' : 'var(--text-secondary)'} />
                <span style={{ ...styles.navText, color: isActive ? '#f8fafc' : 'var(--text-secondary)' }}>
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={styles.bottomSection}>
        {/* Visit Target Website button */}
        <a
          href={TARGET_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.visitBtn}
        >
          <ExternalLink size={15} />
          <span>Visit Target Website</span>
        </a>

        <div style={styles.upgradeCard} className="glass-panel card-hover">
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '14px' }}>Pro Plan</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
            Unlock advanced AI analytics
          </p>
          <button style={styles.upgradeBtn}>Upgrade Now</button>
        </div>
      </div>
    </aside>
  );
};


const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 100,
  },
  logoContainer: {
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    borderBottom: '1px solid var(--border-color)',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--accent-primary), #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    boxShadow: '0 4px 12px var(--accent-glow)',
  },
  logoText: {
    color: 'var(--text-primary)',
    fontWeight: 700,
    fontSize: '20px',
    letterSpacing: '-0.5px',
  },
  nav: {
    flex: 1,
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    position: 'relative',
  },
  navText: {
    marginLeft: '12px',
    fontWeight: 500,
    fontSize: '15px',
  },
  bottomSection: {
    padding: '24px 16px',
    borderTop: '1px solid var(--border-color)',
  },
  upgradeCard: {
    padding: '16px',
    textAlign: 'center',
  },
  upgradeBtn: {
    backgroundColor: 'var(--accent-primary)',
    color: '#fff',
    width: '100%',
    padding: '8px 0',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '13px',
    transition: 'background-color 0.2s ease',
  },
  visitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
  },
};

export default Sidebar;
