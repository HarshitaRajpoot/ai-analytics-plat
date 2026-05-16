import React from 'react';
import { Users, MousePointerClick, Clock, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Mon', users: 4000, sessions: 2400 },
  { name: 'Tue', users: 3000, sessions: 1398 },
  { name: 'Wed', users: 2000, sessions: 9800 },
  { name: 'Thu', users: 2780, sessions: 3908 },
  { name: 'Fri', users: 1890, sessions: 4800 },
  { name: 'Sat', users: 2390, sessions: 3800 },
  { name: 'Sun', users: 3490, sessions: 4300 },
];

const Dashboard: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Overview</h1>
          <p style={styles.subtitle}>Welcome back! Here's your traffic summary.</p>
        </div>
      </div>

      <div style={styles.grid}>
        <StatCard title="Total Users" value="12,345" change={12.5} icon={Users} trend="up" />
        <StatCard title="Sessions" value="45,678" change={8.2} icon={MousePointerClick} trend="up" />
        <StatCard title="Bounce Rate" value="42.3%" change={-2.4} icon={TrendingUp} trend="down" />
        <StatCard title="Avg. Session" value="2m 14s" change={5.1} icon={Clock} trend="up" />
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard} className="glass-panel animate-fade-in">
          <h3 style={styles.chartTitle}>Traffic Overview</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-tertiary)" tick={{fill: 'var(--text-tertiary)'}} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" tick={{fill: 'var(--text-tertiary)'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="users" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '15px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
    marginTop: '8px',
  },
  chartCard: {
    padding: '24px',
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '24px',
  },
  chartWrapper: {
    flex: 1,
    minHeight: 0,
  }
};

export default Dashboard;
