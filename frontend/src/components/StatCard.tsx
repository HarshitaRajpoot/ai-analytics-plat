import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, trend }) => {
  const isPositive = trend === 'up' || change >= 0;
  
  return (
    <div style={styles.card} className="glass-panel card-hover animate-fade-in">
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        <div style={styles.iconWrapper}>
          <Icon size={20} color="var(--accent-primary)" />
        </div>
      </div>
      
      <div style={styles.body}>
        <h3 style={styles.value}>{value}</h3>
      </div>
      
      <div style={styles.footer}>
        <div 
          style={{ 
            ...styles.badge, 
            color: isPositive ? 'var(--success)' : 'var(--danger)',
            backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
          }}
        >
          {isPositive ? '+' : ''}{change}%
        </div>
        <span style={styles.footerText}>vs last 30 days</span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: '240px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: 500,
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {},
  value: {
    fontSize: '32px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-1px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
  },
  footerText: {
    color: 'var(--text-tertiary)',
    fontSize: '13px',
  },
};

export default StatCard;
