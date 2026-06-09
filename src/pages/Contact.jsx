import React, { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle2 } from 'lucide-react';

export const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    // Simulate contact submission
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');

    // Reset notification after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '4rem 0', backgroundColor: '#ffffff', minHeight: '85vh' }}>

      {/* Page Title Header */}
      <section className="container" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          marginBottom: '1rem',
          color: '#002060',
          fontFamily: 'var(--font-heading)'
        }}>
          Contact Us
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Have questions about the Annual Parade Rehersal, Senior Ranking Exams, or any other events? Get in touch with our secretariat.
        </p>
      </section>

      {/* Main 2-Column Section */}
      <section className="container" style={{ maxWidth: '1100px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'start'
        }}>

          {/* Left Column: Contact Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#002060', borderBottom: '2px solid #ca8a04', paddingBottom: '0.5rem', display: 'inline-block', alignSelf: 'flex-start' }}>
              Secretariat Info
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Address */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={iconBoxStyle}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={infoTitleStyle}>Office Address</h4>
                  <p style={infoTextStyle}>
                    Lagos West Baptist Conference Secretariat,<br />
                    32 Baptist Church Street, Ikeja,<br />
                    Lagos, Nigeria.
                  </p>
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={iconBoxStyle}>
                  <Mail size={22} />
                </div>
                <div>
                  <h4 style={infoTitleStyle}>Email Address</h4>
                  <p style={infoTextStyle}>
                    secretariat@ralwbc.org<br />
                    contact@ralwbc.org
                  </p>
                </div>
              </div>

              {/* Phones */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={iconBoxStyle}>
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={infoTitleStyle}>Phone Numbers</h4>
                  <p style={infoTextStyle}>
                    +234 803 123 4567<br />
                    +234 812 987 6543
                  </p>
                </div>
              </div>

              {/* Clock Hours */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={iconBoxStyle}>
                  <Clock size={22} />
                </div>
                <div>
                  <h4 style={infoTitleStyle}>Office Hours</h4>
                  <p style={infoTextStyle}>
                    Monday – Friday: 9:00 AM – 5:00 PM<br />
                    Saturday: 10:00 AM – 2:00 PM
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="glass-panel" style={{
            padding: '2.5rem',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(0, 32, 96, 0.05)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#002060', marginBottom: '1.5rem' }}>
              Send us a Message
            </h2>

            {submitted && (
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                backgroundColor: 'rgba(22, 163, 74, 0.08)',
                border: '1px solid rgba(22, 163, 74, 0.15)',
                color: '#16a34a',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                alignItems: 'center'
              }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>Thank you! Your message has been sent successfully. We will get back to you shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Name */}
              <div>
                <label style={labelStyle}>Full Name<span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={formInputStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address<span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={formInputStyle}
                />
              </div>

              {/* Subject */}
              <div>
                <label style={labelStyle}>Subject</label>
                <input
                  type="text"
                  placeholder="What is this regarding?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={formInputStyle}
                />
              </div>

              {/* Message */}
              <div>
                <label style={labelStyle}>Message<span style={{ color: '#ef4444' }}>*</span></label>
                <textarea
                  required
                  rows="4"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ ...formInputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                style={{
                  backgroundColor: '#002060',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.85rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 10px rgba(0, 32, 96, 0.15)',
                  transition: 'background-color 0.2s',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#001848'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#002060'}
              >
                <Send size={16} /> Send Message
              </button>

            </form>
          </div>

        </div>
      </section>

    </div>
  );
};

// Styling variables
const iconBoxStyle = {
  backgroundColor: 'rgba(202, 138, 4, 0.08)',
  color: '#ca8a04',
  padding: '0.6rem',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const infoTitleStyle = {
  fontSize: '1.05rem',
  fontWeight: '700',
  color: '#000000',
  marginBottom: '0.25rem',
  fontFamily: 'var(--font-heading)'
};

const infoTextStyle = {
  fontSize: '0.9rem',
  color: '#475569',
  lineHeight: '1.5'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: '700',
  color: '#000000',
  marginBottom: '0.4rem',
  fontFamily: 'var(--font-heading)'
};

const formInputStyle = {
  width: '100%',
  padding: '0.8rem 1rem',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '0.95rem',
  color: '#000000',
  outline: 'none',
  backgroundColor: '#ffffff',
  fontFamily: 'var(--font-body)'
};

export default Contact;
