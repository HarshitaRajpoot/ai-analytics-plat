import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="admin" element={<Admin />} />
          <Route path="analytics" element={<div style={{ padding: '20px' }}><h2>Analytics Page (Coming Soon)</h2></div>} />
          <Route path="insights" element={<div style={{ padding: '20px' }}><h2>AI Insights (Coming Soon)</h2></div>} />
          <Route path="reports" element={<div style={{ padding: '20px' }}><h2>Reports (Coming Soon)</h2></div>} />
          <Route path="settings" element={<div style={{ padding: '20px' }}><h2>Settings (Coming Soon)</h2></div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
