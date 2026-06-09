import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { RANK_CATEGORIES, getRankLabel } from '../services/db';

export const Profile = () => {
  const { currentUser, updateProfile } = useAuth();

  // Form states
  const [name, setName]                   = useState('');
  const [dob, setDob]                     = useState('');
  const [email, setEmail]                 = useState('');
  const [phone, setPhone]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [church, setChurch]               = useState('');
  const [address, setAddress]             = useState('');
  const [chapterName, setChapterName]     = useState('');
  const [association, setAssociation]     = useState('');
  const [avatar, setAvatar]               = useState('');

  const [msg, setMsg]             = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load current values
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setDob(currentUser.dob || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || currentUser.phoneNumber || '');
      setChurch(currentUser.church || '');
      setAddress(currentUser.address || '');
      setChapterName(currentUser.chapterName || '');
      setAssociation(currentUser.association || '');
      setAvatar(currentUser.avatar || '');
    }
  }, [currentUser]);

  // Canvas Image Compressor
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX    = 300;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX)  { height *= MAX / width;  width = MAX; }
        } else {
          if (height > MAX) { width  *= MAX / height; height = MAX; }
        }
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        setAvatar(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (password) {
      if (password.length < 6) {
        setMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
        return;
      }
      if (password !== confirmPassword) {
        setMsg({ type: 'error', text: 'Passwords do not match.' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        name,
        dob,
        phone,
        phoneNumber: phone,
        church,
        address,
        chapterName,
        association,
        avatar,
      };
      if (password) {
        updateData.password = password;
      }
      await updateProfile(updateData);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      setPassword('');
      setConfirmPassword('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update profile details.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rankLabel = currentUser?.rankCategory
    ? getRankLabel(currentUser.rankCategory)
    : null;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', backgroundColor: '#ffffff', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', color: '#000000', fontFamily: 'var(--font-heading)' }}>
          Edit Profile
        </h1>

        {/* Rank category read-only display */}
        {rankLabel && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'rgba(202,138,4,0.08)', border: '1px solid rgba(202,138,4,0.2)',
            borderRadius: '20px', padding: '0.35rem 1rem',
            fontSize: '0.8rem', fontWeight: '700', color: '#92400e',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: '2rem',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ca8a04', display: 'inline-block' }} />
            RA Rank: {rankLabel}
          </div>
        )}

        {msg.text && (
          <div style={{
            display: 'flex', gap: '0.5rem',
            backgroundColor: msg.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
            padding: '1rem', borderRadius: '8px',
            color: msg.type === 'success' ? '#10b981' : '#ef4444',
            fontSize: '0.9rem', marginBottom: '2rem', alignItems: 'center',
          }}>
            {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Two-column Input Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
          }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle} htmlFor="prof-name">Full Name</label>
                <input
                  id="prof-name"
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-email">Email (read-only)</label>
                <input
                  id="prof-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  disabled
                  style={{ ...inputStyle, backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-phone">Phone</label>
                <input
                  id="prof-phone"
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-pw">New Password (leave blank to keep current)</label>
                <input
                  id="prof-pw"
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-church">Church</label>
                <input
                  id="prof-church"
                  type="text"
                  placeholder="Church"
                  value={church}
                  onChange={(e) => setChurch(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-chapter">Chapter Name</label>
                <input
                  id="prof-chapter"
                  type="text"
                  placeholder="Chapter Name"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle} htmlFor="prof-dob">Date of Birth</label>
                <input
                  id="prof-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-cpw">Confirm New Password</label>
                <input
                  id="prof-cpw"
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-address">Address</label>
                <input
                  id="prof-address"
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-assoc">Association</label>
                <input
                  id="prof-assoc"
                  type="text"
                  placeholder="Association"
                  value={association}
                  onChange={(e) => setAssociation(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>

          {/* Profile Image Uploader */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            borderTop: '1px solid #e2e8f0', paddingTop: '2rem', marginTop: '1rem',
          }}>
            <label style={labelStyle}>Profile Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {avatar && (
                <img
                  src={avatar}
                  alt="Profile Avatar"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  aria-label="Upload profile photo"
                  style={{
                    display: 'block', width: '100%', padding: '0.75rem 1rem',
                    backgroundColor: '#edf2f7', border: '1px solid #cbd5e1',
                    borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#0a1141', color: '#ffffff', border: 'none',
                borderRadius: '8px', padding: '0.9rem 4rem', fontSize: '1rem',
                fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(10,17,65,0.25)', transition: 'background-color 0.2s',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// Shared input style
const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: '#475569',
  marginBottom: '0.4rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const inputStyle = {
  width: '100%',
  padding: '0.9rem 1.25rem',
  backgroundColor: '#edf2f7',
  border: 'none',
  borderRadius: '8px',
  color: '#000000',
  fontSize: '1rem',
  outline: 'none',
  fontFamily: 'var(--font-body)',
};

export default Profile;
