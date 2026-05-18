import React, { useEffect, useState } from 'react';
import { Users, Building2, Phone, Mail, Tag, Search, ExternalLink, RefreshCw } from 'lucide-react';

interface Contact {
  id: number;
  full_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  segment: string;
  created_at: string;
}

const SEGMENT_COLORS: Record<string, string> = {
  'High-Value Lead': '#10b981',
  'Business Lead': '#6366f1',
  'Warm Lead': '#f59e0b',
  'New Subscriber': '#94a3b8',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TARGET_WEBSITE_URL = import.meta.env.VITE_TARGET_WEBSITE_URL || 'http://localhost:5500/target-website/index.html';

const Admin: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterSegment, setFilterSegment] = useState('All');
  const [selected, setSelected] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contacts`);
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch {
      setError('Failed to load contacts. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const segments = ['All', 'High-Value Lead', 'Business Lead', 'Warm Lead', 'New Subscriber'];

  const filtered = contacts.filter(c => {
    const matchSearch = (
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(search.toLowerCase())
    );
    const matchSegment = filterSegment === 'All' || c.segment === filterSegment;
    return matchSearch && matchSegment;
  });

  const segmentCounts = segments.slice(1).reduce((acc, seg) => {
    acc[seg] = contacts.filter(c => c.segment === seg).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>CRM Admin</h1>
          <p style={styles.subtitle}>All contact submissions from your target website</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a
            href={TARGET_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.visitBtn}
            onClick={() => {}}
          >
            <ExternalLink size={16} /> Visit Target Website
          </a>
          <button onClick={fetchContacts} style={styles.refreshBtn}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Segment summary cards */}
      <div style={styles.segmentGrid}>
        {segments.slice(1).map(seg => (
          <div
            key={seg}
            style={{ ...styles.segmentCard, cursor: 'pointer', borderColor: filterSegment === seg ? SEGMENT_COLORS[seg] : 'var(--border-color)' }}
            className="glass-panel"
            onClick={() => setFilterSegment(filterSegment === seg ? 'All' : seg)}
          >
            <div style={{ ...styles.segmentDot, background: SEGMENT_COLORS[seg] }} />
            <div>
              <div style={styles.segmentCount}>{segmentCounts[seg] || 0}</div>
              <div style={styles.segmentLabel}>{seg}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={16} color="var(--text-tertiary)" />
          <input
            style={styles.searchInput}
            placeholder="Search by name, email or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterSegment}
          onChange={e => setFilterSegment(e.target.value)}
          style={styles.select}
        >
          {segments.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.loadingBox}>Loading contacts...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyBox}>
          <Users size={48} color="var(--text-tertiary)" />
          <p>No contacts yet. Submit the form on your target website to see data here!</p>
        </div>
      ) : (
        <div style={styles.layout}>
          {/* Contact list */}
          <div style={styles.contactList} className="glass-panel">
            {filtered.map(contact => (
              <div
                key={contact.id}
                style={{ ...styles.contactRow, background: selected?.id === contact.id ? 'rgba(99,102,241,0.08)' : 'transparent' }}
                onClick={() => setSelected(contact)}
              >
                <div style={styles.avatar}>{contact.full_name.charAt(0).toUpperCase()}</div>
                <div style={styles.contactInfo}>
                  <div style={styles.contactName}>{contact.full_name}</div>
                  <div style={styles.contactEmail}>{contact.email}</div>
                </div>
                <span style={{ ...styles.segBadge, background: SEGMENT_COLORS[contact.segment] + '22', color: SEGMENT_COLORS[contact.segment] }}>
                  {contact.segment}
                </span>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={styles.detailPanel} className="glass-panel">
              <div style={styles.detailHeader}>
                <div style={styles.bigAvatar}>{selected.full_name.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={styles.detailName}>{selected.full_name}</div>
                  <span style={{ ...styles.segBadge, background: SEGMENT_COLORS[selected.segment] + '22', color: SEGMENT_COLORS[selected.segment] }}>
                    {selected.segment}
                  </span>
                </div>
              </div>
              <div style={styles.detailFields}>
                <div style={styles.detailField}><Mail size={14} color="var(--text-tertiary)" /><span>{selected.email}</span></div>
                {selected.company && <div style={styles.detailField}><Building2 size={14} color="var(--text-tertiary)" /><span>{selected.company}</span></div>}
                {selected.phone && <div style={styles.detailField}><Phone size={14} color="var(--text-tertiary)" /><span>{selected.phone}</span></div>}
                <div style={styles.detailField}><Tag size={14} color="var(--text-tertiary)" /><span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{new Date(selected.created_at).toLocaleString()}</span></div>
              </div>
              <div style={styles.messageBox}>
                <div style={styles.messageLabel}>Message</div>
                <p style={styles.messageText}>{selected.message}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '14px' },
  visitBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--accent-primary)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' },
  segmentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' },
  segmentCard: { padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'border-color 0.2s' },
  segmentDot: { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0 },
  segmentCount: { fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' },
  segmentLabel: { fontSize: '12px', color: 'var(--text-secondary)' },
  toolbar: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 16px' },
  searchInput: { border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', flex: 1 },
  select: { padding: '10px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', alignItems: 'start' },
  contactList: { overflow: 'hidden' },
  contactRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid var(--border-color)' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '15px', flexShrink: 0 },
  contactInfo: { flex: 1, minWidth: 0 },
  contactName: { fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  contactEmail: { color: 'var(--text-secondary)', fontSize: '12px' },
  segBadge: { padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' },
  detailPanel: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '20px' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '16px' },
  bigAvatar: { width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '22px', flexShrink: 0 },
  detailName: { fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px', marginBottom: '6px' },
  detailFields: { display: 'flex', flexDirection: 'column', gap: '12px' },
  detailField: { display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '14px' },
  messageBox: { background: 'var(--bg-primary)', borderRadius: '8px', padding: '16px' },
  messageLabel: { fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' },
  messageText: { color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' },
  errorBox: { padding: '16px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '8px' },
  loadingBox: { textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' },
  emptyBox: { textAlign: 'center', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)' },
};

export default Admin;
