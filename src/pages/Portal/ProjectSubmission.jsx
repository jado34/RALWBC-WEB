import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import {
  Upload, FileText, CheckCircle, AlertTriangle, Clock,
  Eye, Trash2, ArrowLeft, BookOpen, Info, ShieldAlert,
  FilePlus, File, Download
} from 'lucide-react';

export const ProjectSubmission = () => {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [supervisorInfo, setSupervisorInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const isAmbEx = currentUser?.rankCategory === 'ambassador_extraordinary' ||
    currentUser?.rank_category === 'ambassador_extraordinary';

  useEffect(() => {
    dbService.init();
    if (isAmbEx) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      const [subs, svs] = await Promise.all([
        dbService.getProjectSubmissions(currentUser.id),
        dbService.getProjectSupervisors()
      ]);
      setSubmissions(subs);

      // Find supervisor assigned to this candidate
      const mySupervisor = svs.find(s => s.candidateUserId === currentUser.id);
      setSupervisorInfo(mySupervisor || null);
    } catch (err) {
      console.error('Failed to load project data:', err);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const allowed = [
      'application/pdf'
    ];

    if (!allowed.includes(file.type)) {
      setUploadMsg('❌ Invalid file type. Only PDF (.pdf) documents are accepted.');
      return;
    }

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadMsg(`❌ File too large. Maximum allowed size is ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    setUploadMsg('');
    setUploadProgress(10);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 15, 85));
      }, 400);

      await dbService.uploadProjectFile(currentUser.id, file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1500);

      setUploadMsg(`✅ "${file.name}" uploaded successfully! Your supervisor and the Ranking Team now have access to it.`);
      loadData();
    } catch (err) {
      setUploadProgress(0);
      setUploadMsg('❌ Upload failed: ' + (err.message || 'Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const formatFileSize = (url) => '—';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // ── If not Amb. Extraordinary, show info card ───────────────────────────────
  if (!isAmbEx) {
    return (
      <div className="animate-fade-in" style={{ padding: '3rem 0' }}>
        <section className="container">
          <div className="glass-panel" style={{
            padding: '4rem 3rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto',
            borderLeft: '4px solid #ca8a04'
          }}>
            <BookOpen size={52} color="#ca8a04" style={{ marginBottom: '1.5rem' }} />
            <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Project Submission</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              The project submission portal is exclusively for candidates enrolled in the
              <strong style={{ color: 'var(--text-primary)' }}> Ambassador Extraordinary</strong> ranking programme.
              Your current rank category does not require a project submission.
            </p>
            <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowLeft size={15} /> Back to Dashboard
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '3rem 0' }}>
      <section className="container" style={{ maxWidth: '900px' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '2.3rem', margin: '0 0 0.4rem 0' }}>Project Submission</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Ambassador Extraordinary — Upload your reviewed project document for ranking committee access.
          </p>
        </div>

        {/* Supervisor Info Card */}
        <div className="glass-panel" style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          borderLeft: supervisorInfo ? '4px solid #9333ea' : '4px solid #ca8a04',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.25rem'
        }}>
          {supervisorInfo ? (
            <>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                backgroundColor: 'rgba(147,51,234,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <CheckCircle size={22} color="#9333ea" />
              </div>
              <div>
                <p style={{ fontWeight: '800', fontSize: '1rem', margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                  Supervisor Assigned
                </p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{supervisorInfo.supervisorName}</strong>
                  {supervisorInfo.supervisorContact && (
                    <> &bull; <span style={{ fontFamily: 'monospace' }}>{supervisorInfo.supervisorContact}</span></>
                  )}
                  {supervisorInfo.projectTitle && (
                    <><br />Project: <em>{supervisorInfo.projectTitle}</em></>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                backgroundColor: 'rgba(202,138,4,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <AlertTriangle size={22} color="#ca8a04" />
              </div>
              <div>
                <p style={{ fontWeight: '800', fontSize: '1rem', margin: '0 0 0.25rem 0', color: '#ca8a04' }}>
                  No Supervisor Assigned Yet
                </p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  A supervisor has not yet been assigned to your project. The ranking officer will assign one shortly.
                  You may still upload your document when ready.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Upload Area */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FilePlus size={20} color="#9333ea" /> Upload Project Document
          </h2>

          {/* Drag and Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#9333ea' : 'rgba(147,51,234,0.4)'}`,
              borderRadius: '12px',
              padding: '3rem 2rem',
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: dragOver ? 'rgba(147,51,234,0.06)' : 'rgba(147,51,234,0.02)',
              transform: dragOver ? 'scale(1.01)' : 'scale(1)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />

            {uploading ? (
              <div>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  backgroundColor: 'rgba(147,51,234,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}>
                  <Upload size={26} color="#9333ea" style={{ animation: 'pulse 1s infinite' }} />
                </div>
                <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem' }}>
                  Uploading...
                </p>
                {/* Progress bar */}
                <div style={{ width: '100%', maxWidth: '320px', margin: '0 auto', backgroundColor: 'rgba(147,51,234,0.1)', borderRadius: '4px', height: '6px' }}>
                  <div style={{
                    height: '6px', borderRadius: '4px',
                    backgroundColor: '#9333ea',
                    width: `${uploadProgress}%`,
                    transition: 'width 0.4s ease'
                  }} />
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{uploadProgress}%</p>
              </div>
            ) : (
              <>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  backgroundColor: 'rgba(147,51,234,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}>
                  <Upload size={28} color="#9333ea" />
                </div>
                <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', fontSize: '1.05rem' }}>
                  {dragOver ? 'Drop your file here' : 'Click to browse or drag & drop'}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Supported format: <strong>PDF</strong>
                </p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  fontSize: '0.78rem', color: 'var(--text-muted)',
                  padding: '0.35rem 0.85rem',
                  border: '1px solid rgba(147,51,234,0.2)',
                  borderRadius: '20px'
                }}>
                  <Info size={12} /> Maximum file size: 10MB
                </div>
              </>
            )}
          </div>

          {/* Upload Message */}
          {uploadMsg && (
            <div style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.9rem', fontWeight: '600',
              backgroundColor: uploadMsg.startsWith('✅') ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              color: uploadMsg.startsWith('✅') ? '#059669' : '#dc2626',
              border: `1px solid ${uploadMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem'
            }}>
              {uploadMsg.startsWith('✅') ? <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> : <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '1px' }} />}
              <span>{uploadMsg.replace(/^[✅❌]\s*/, '')}</span>
            </div>
          )}
        </div>

        {/* Submission Guidelines */}
        <div className="glass-panel" style={{ padding: '1.75rem 2rem', marginBottom: '2rem', borderLeft: '4px solid rgba(10,17,65,0.4)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={16} /> Submission Guidelines
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {[
              'Your project must be reviewed with your assigned supervisor before uploading.',
              'Submit only the final, reviewed version — the ranking committee will access whatever you upload.',
              'You may upload multiple versions. The ranking team will review the most recent upload.',
              'File format accepted: PDF (.pdf). Maximum size: 10MB.',
              'Once uploaded, your document is immediately accessible to your supervisor and the Super Admin.',
              'Do not upload incomplete drafts — once submitted, it is considered a final submission.'
            ].map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <span style={{ color: '#9333ea', fontWeight: '800', flexShrink: 0, marginTop: '1px' }}>{i + 1}.</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Submissions */}
        <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="#0a1141" /> My Uploaded Documents
            <span style={{
              marginLeft: 'auto', fontSize: '0.78rem', fontWeight: '700',
              padding: '0.2rem 0.65rem', borderRadius: '12px',
              backgroundColor: 'rgba(10,17,65,0.08)', color: '#0a1141'
            }}>
              {submissions.length} {submissions.length === 1 ? 'file' : 'files'}
            </span>
          </h2>

          {submissions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {submissions.map((sub, index) => (
                <div key={sub.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1.1rem 1.4rem',
                  border: index === 0 ? '2px solid rgba(147,51,234,0.4)' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  backgroundColor: index === 0 ? 'rgba(147,51,234,0.04)' : 'transparent',
                  flexWrap: 'wrap'
                }}>
                  {/* File icon */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '8px',
                    backgroundColor: index === 0 ? 'rgba(147,51,234,0.12)' : 'rgba(10,17,65,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <File size={20} color={index === 0 ? '#9333ea' : '#0a1141'} />
                  </div>

                  {/* File info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {sub.fileName}
                      {index === 0 && (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: '800', padding: '0.1rem 0.45rem',
                          borderRadius: '10px', backgroundColor: '#9333ea', color: '#fff',
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>Latest</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={11} />
                      Uploaded {formatDate(sub.uploadedAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <a
                      href={sub.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.5rem 1rem', borderRadius: '6px',
                        backgroundColor: index === 0 ? '#9333ea' : 'transparent',
                        color: index === 0 ? '#fff' : 'var(--text-secondary)',
                        border: index === 0 ? 'none' : '1px solid var(--border-color)',
                        fontWeight: '700', fontSize: '0.82rem', textDecoration: 'none'
                      }}
                    >
                      <Eye size={13} /> View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <File size={40} style={{ marginBottom: '1rem', color: 'var(--text-muted)', opacity: 0.5 }} />
              <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>No documents uploaded yet</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                Use the upload area above to submit your project document.
              </p>
            </div>
          )}
        </div>

      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ProjectSubmission;
