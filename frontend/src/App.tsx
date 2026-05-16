import React from 'react';
import { 
  BarChart3, 
  Users, 
  Eye, 
  MousePointerClick, 
  LayoutDashboard, 
  Settings, 
  Bell,
  ArrowUpRight
} from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <BarChart3 className="brand-icon" size={28} />
          <span>AI Analytics</span>
        </div>
        
        <nav className="nav-links">
          <a href="#" className="nav-link active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-link">
            <Users size={20} />
            <span>Audience</span>
          </a>
          <a href="#" className="nav-link">
            <MousePointerClick size={20} />
            <span>Behavior</span>
          </a>
          <a href="#" className="nav-link">
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h2>Overview</h2>
          
          <div className="user-profile">
            <button className="icon-btn" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
              <Bell size={20} />
            </button>
            <div className="avatar">A</div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="card stat-card">
              <div className="stat-header">
                <span className="stat-label">Active Users</span>
                <div className="stat-icon"><Users size={20} /></div>
              </div>
              <div className="stat-value">2,451</div>
              <div className="trend-up">
                <ArrowUpRight size={16} />
                <span>+12.5% from last week</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-header">
                <span className="stat-label">Page Views</span>
                <div className="stat-icon"><Eye size={20} /></div>
              </div>
              <div className="stat-value">12,845</div>
              <div className="trend-up">
                <ArrowUpRight size={16} />
                <span>+8.2% from last week</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-header">
                <span className="stat-label">Click Rate</span>
                <div className="stat-icon"><MousePointerClick size={20} /></div>
              </div>
              <div className="stat-value">4.2%</div>
              <div className="trend-up">
                <ArrowUpRight size={16} />
                <span>+1.1% from last week</span>
              </div>
            </div>
          </div>

          {/* Charts Area */}
          <div className="charts-grid">
            <div className="card chart-card">
              <h3>Traffic Overview</h3>
              <div className="placeholder-chart">
                <p>Chart Data Visualization will go here</p>
              </div>
            </div>
            
            <div className="card chart-card">
              <h3>AI Insights</h3>
              <div className="placeholder-chart" style={{ borderColor: 'var(--accent-color)', background: 'rgba(59, 130, 246, 0.05)' }}>
                <p style={{ textAlign: 'center', padding: '1rem' }}>
                  <strong>Claude AI Analysis:</strong><br/>
                  Traffic is up 12% this week. Consider writing more content about 'React Hooks' as it's driving the most engagement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
