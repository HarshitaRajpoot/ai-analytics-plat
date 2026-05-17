import React, { useEffect, useState } from 'react';
import { Users, MousePointerClick, Clock, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TrafficData {
  totals: {
    users: string | number;
    sessions: string | number;
    pageviews: string | number;
    bounceRate: string;
    avgSession: string;
  };
  daily: Array<{
    name: string;
    users: number;
    sessions: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/traffic');
        const json = await response.json();
        
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to connect to backend API.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Overview</h1>
          <p style={styles.subtitle}>Welcome back! Here's your live traffic summary.</p>
        </div>
        {loading && <span style={{ color: 'var(--accent-primary)' }}>Refreshing data...</span>}
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div style={styles.grid}>
        <StatCard 
          title="Total Users" 
          value={data ? data.totals.users : '-'} 
          change={0} 
          icon={Users} 
          trend="up" 
        />
        <StatCard 
          title="Sessions" 
          value={data ? data.totals.sessions : '-'} 
          change={0} 
          icon={MousePointerClick} 
          trend="up" 
        />
        <StatCard 
          title="Bounce Rate" 
          value={data ? data.totals.bounceRate : '-'} 
          change={0} 
          icon={TrendingUp} 
          trend="down" 
        />
        <StatCard 
          title="Avg. Session" 
          value={data ? data.totals.avgSession : '-'} 
          change={0} 
          icon={Clock} 
          trend="up" 
        />
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard} className="glass-panel animate-fade-in">
          <h3 style={styles.chartTitle}>Traffic Overview (Last 7 Days)</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data ? data.daily : []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
