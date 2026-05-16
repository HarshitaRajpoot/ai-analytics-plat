import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <div style={styles.searchBar} className="glass-panel">
          <Search size={18} color="var(--text-tertiary)" style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Search analytics, insights..." 
            style={styles.searchInput}
          />
        </div>
      </div>
      
      <div style={styles.right}>
        <button style={styles.iconBtn} className="card-hover">
          <Bell size={20} color="var(--text-secondary)" />
          <span style={styles.badge}></span>
        </button>
        
        <div style={styles.profileBtn} className="card-hover">
          <div style={styles.avatar}>
            <User size={18} color="#fff" />
          </div>
          <span style={styles.userName}>Admin</span>
        </div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'rgba(15, 17, 21, 0.8)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 90,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    width: '300px',
    borderRadius: '12px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    width: '100%',
    fontSize: '14px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  iconBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-tertiary)',
  },
  badge: {
    position: 'absolute',
    top: '8px',
    right: '10px',
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--danger)',
    borderRadius: '50%',
    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    padding: '6px 16px 6px 6px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '30px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
};

export default Header;
