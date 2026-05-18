import React, { useState } from 'react';
import { Send, User, Mail, Building2, Phone, MessageSquare, CheckCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [form, setForm] = useState({ full_name: '', email: '', company: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.detail || 'Submission failed. Please try again.');
      }
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successCard} className="glass-panel">
          <CheckCircle size={64} color="var(--success)" />
          <h2 style={styles.successTitle}>Message Sent!</h2>
          <p style={styles.successText}>Thank you for reaching out. We'll get back to you very soon.</p>
          <button style={styles.btn} onClick={() => { setSuccess(false); setForm({ full_name: '', email: '', company: '', phone: '', message: '' }); }}>
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>Fill in the form below and we'll be in touch shortly.</p>
      </div>

      <div style={styles.layout}>
        {/* Info Cards */}
        <div style={styles.infoPanel}>
          <div style={styles.infoCard} className="glass-panel">
            <h3 style={styles.infoTitle}>What happens next?</h3>
            <div style={styles.steps}>
              {['Your message is securely stored.', 'You are automatically assigned to an audience segment.', 'Our team reviews your inquiry.', 'You receive a personalised reply.'].map((step, i) => (
                <div key={i} style={styles.step}>
                  <div style={styles.stepNumber}>{i + 1}</div>
                  <p style={styles.stepText}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.formCard} className="glass-panel">
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}><User size={14} /> Full Name *</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} required style={styles.input} placeholder="Harshita Rajpoot" />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}><Mail size={14} /> Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required style={styles.input} placeholder="harshita@example.com" />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}><Building2 size={14} /> Company</label>
              <input name="company" value={form.company} onChange={handleChange} style={styles.input} placeholder="Your Company Ltd." />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}><Phone size={14} /> Telephone</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} style={styles.input} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}><MessageSquare size={14} /> Your Message *</label>
            <textarea name="message" value={form.message} onChange={handleChange} required style={styles.textarea} rows={5} placeholder="Tell us how we can help you..." />
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Sending...' : <><Send size={16} /> Send Message</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '32px' },
  header: { display: 'flex', flexDirection: 'column', gap: '8px' },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  subtitle: { color: 'var(--text-secondary)', fontSize: '15px', margin: 0 },
  layout: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' },
  infoPanel: { display: 'flex', flexDirection: 'column', gap: '16px' },
  infoCard: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  infoTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  steps: { display: 'flex', flexDirection: 'column', gap: '16px' },
  step: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  stepNumber: { minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 },
  stepText: { color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: '1.5' },
  formCard: { padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
  input: { background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' },
  textarea: { background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 28px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' },
  errorBox: { padding: '12px 16px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '8px', fontSize: '14px' },
  successContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  successCard: { padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', maxWidth: '400px' },
  successTitle: { fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  successText: { color: 'var(--text-secondary)', margin: 0 },
};

export default Contact;
