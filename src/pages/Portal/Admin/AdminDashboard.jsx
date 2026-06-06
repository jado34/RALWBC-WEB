import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { dbService, RANK_CATEGORIES, getRankLabel } from '../../../services/db';
import {
  Users, Award, ShieldAlert, FileSpreadsheet, PlusCircle, Settings,
  ClipboardList, UserCheck, Download, Plus, CalendarClock,
  ToggleLeft, ToggleRight, Save, Trash2, RotateCcw, Trophy, Medal
} from 'lucide-react';

export const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [candidatePage, setCandidatePage] = useState(1);
  const [submissionPage, setSubmissionPage] = useState(1);
  const itemsPerPage = 10;

  const [stats, setStats] = useState({
    totalUsers: 0, totalSubs: 0, averageScore: 0,
    totalInfractions: 0, totalOfficers: 0
  });

  // Session Settings
  const [session, setSession] = useState({ startDate: '', endDate: '', isOpen: false });
  const [sessionSaved, setSessionSaved] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get('tab');

  useEffect(() => {
    dbService.init();
    loadDashboardData();
    const s = dbService.getSession();
    setSession({ startDate: s.startDate || '', endDate: s.endDate || '', isOpen: s.isOpen || false });
  }, [location.search]);

  const loadDashboardData = () => {
    const allSubs = dbService.getSubmissions();
    const allUsers = JSON.parse(localStorage.getItem('ralwbc_users') || '[]');
    const studentUsers = allUsers.filter(u => u.role === 'student');
    const allOfficers = dbService.getOfficers();

    const map = {};
    allUsers.forEach(u => { map[u.id] = u; });
    setUserMap(map);

    let totalScore = 0, totalWarnings = 0;
    allSubs.forEach(s => { totalScore += s.scorePercentage; totalWarnings += s.warningsCount; });

    setSubmissions(allSubs.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
    setCandidates(studentUsers);
    setStats({
      totalUsers: studentUsers.length,
      totalSubs: allSubs.length,
      averageScore: allSubs.length > 0 ? Math.round(totalScore / allSubs.length) : 0,
      totalInfractions: totalWarnings,
      totalOfficers: allOfficers.length
    });
  };

  const handleSaveSession = () => {
    dbService.saveSession({ startDate: session.startDate || null, endDate: session.endDate || null, isOpen: session.isOpen });
    setSessionSaved(true);
    setTimeout(() => setSessionSaved(false), 3000);
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${day}/${month} - ${hours}:${minutes}${ampm}`;
    } catch { return 'N/A'; }
  };

  const formatDuration = (secs) => {
    if (!secs) return 'N/A';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const handleDownloadReport = () => {
    if (submissions.length === 0) { alert('No submissions to download.'); return; }
    let csv = 'data:text/csv;charset=utf-8,S/N,Time,Name,Score,Church,Rank,Category,Warnings\n';
    submissions.forEach((sub, i) => {
      const u = userMap[sub.userId] || {};
      csv += `${i + 1},${formatTime(sub.submittedAt)},${(sub.userName || '').replace(/,/g, '')},${sub.scorePercentage}%,${(u.church || 'N/A').replace(/,/g, '')},${(u.rank || 'N/A').replace(/,/g, '')},${getRankLabel(u.rankCategory)},${sub.warningsCount}\n`;
    });
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `RALWBC_Submissions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleDownloadCandidates = () => {
    if (candidates.length === 0) { alert('No candidates to download.'); return; }
    let csv = 'data:text/csv;charset=utf-8,S/N,Name,Email,Association,Church,Rank Category,Rank Title,Phone\n';
    candidates.forEach((u, i) => {
      csv += `${i + 1},${(u.name || '').replace(/,/g, '')},${(u.email || '').replace(/,/g, '')},${(u.association || 'N/A').replace(/,/g, '')},${(u.church || 'N/A').replace(/,/g, '')},${getRankLabel(u.rankCategory)},${(u.rank || 'N/A').replace(/,/g, '')},${(u.phoneNumber || 'N/A').replace(/,/g, '')}\n`;
    });
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `RALWBC_Candidates_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleDeleteCandidate = (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete "${userName}"? This will also remove all their exam submissions.`)) {
      dbService.deleteUser(userId);
      loadDashboardData();
    }
  };

  const handleRevokeSubmission = (submissionId, userName) => {
    if (window.confirm(`Revoke "${userName}"'s submission? They will be able to re-take the exam.`)) {
      dbService.deleteSubmission(submissionId);
      loadDashboardData();
    }
  };

  const handleResetExamSubmissions = (examId, examTitle) => {
    if (window.confirm(`Reset ALL submissions for "${examTitle}"? This wipes every result for this exam and cannot be undone.`)) {
      dbService.resetExamSubmissions(examId);
      loadDashboardData();
    }
  };

  const getInfractionColor = (count) => {
    if (count >= 3) return '#ef4444';
    if (count > 0) return '#ca8a04';
    return '#10b981';
  };

  // ── CANDIDATES TAB ─────────────────────────────────────────────────────────
  if (currentTab === 'candidates') {
    const filtered = candidates.filter(u => {
      const q = searchQuery.toLowerCase();
      return (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.church || '').toLowerCase().includes(q) ||
        getRankLabel(u.rankCategory).toLowerCase().includes(q);
    });
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = filtered.slice((candidatePage - 1) * itemsPerPage, candidatePage * itemsPerPage);

    return (
      <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', minHeight: '80vh' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#000000' }}>Registered Candidates</h1>
          <p style={{ color: '#475569', fontSize: '0.95rem' }}>View and manage all registered Royal Ambassadors.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" placeholder="Search candidates..." value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCandidatePage(1); }}
            style={{ padding: '0.75rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%', maxWidth: '320px', fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-body)' }} />
          <button onClick={handleDownloadCandidates} style={{ ...goldBtnStyle }}>
            <Download size={18} /> Export Excel (CSV)
          </button>
        </div>

        <div style={{ borderTop: '2px solid #000000', paddingTop: '1rem', overflowX: 'auto' }}>
          {filtered.length > 0 ? (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #000000', fontSize: '1rem', color: '#000000', fontFamily: 'var(--font-heading)' }}>
                    {['S/N', 'Name', 'Email', 'Association', 'Church', 'Rank Category', 'Phone', 'Action'].map(h => (
                      <th key={h} style={{ padding: '1rem 0.5rem', fontWeight: '800' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((u, idx) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#000000' }}>
                      <td style={{ padding: '1rem 0.5rem' }}>{(candidatePage - 1) * itemsPerPage + idx + 1}</td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{u.name}</td>
                      <td style={{ padding: '1rem', color: '#475569' }}>{u.email}</td>
                      <td style={{ padding: '1rem', color: '#475569' }}>{u.association || 'N/A'}</td>
                      <td style={{ padding: '1rem', color: '#475569' }}>{u.church || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(10,17,65,0.08)', color: '#0a1141' }}>
                          {getRankLabel(u.rankCategory)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#475569' }}>{u.phoneNumber || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => handleDeleteCandidate(u.id, u.name)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PaginationControls page={candidatePage} total={totalPages} onPrev={() => setCandidatePage(p => Math.max(1, p - 1))} onNext={() => setCandidatePage(p => Math.min(totalPages, p + 1))} />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontStyle: 'italic' }}>No candidates found.</div>
          )}
        </div>
      </div>
    );
  }

  // ── EXAM SUBMISSIONS TAB ───────────────────────────────────────────────────
  if (currentTab === 'exams') {
    const allExams = dbService.getExams();
    const totalPages = Math.ceil(submissions.length / itemsPerPage) || 1;
    const paginated = submissions.slice((submissionPage - 1) * itemsPerPage, submissionPage * itemsPerPage);

    return (
      <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', minHeight: '80vh' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#000000' }}>Examination Submissions</h1>
          <p style={{ color: '#475569', fontSize: '0.95rem' }}>Monitor scores, revoke individual submissions, or reset all results per exam.</p>
        </div>

        {/* Per-exam reset buttons */}
        {allExams.length > 0 && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {allExams.map(exam => (
              <button key={exam.id} onClick={() => handleResetExamSubmissions(exam.id, exam.title)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'transparent', color: '#ef4444', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>
                <RotateCcw size={13} /> Reset: {exam.title.substring(0, 30)}{exam.title.length > 30 ? '…' : ''}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadReport} style={{ ...goldBtnStyle }}><Download size={18} /> Download Scores (CSV)</button>
          <button onClick={() => navigate('/admin/exams')} style={{ ...navyBtnStyle }}><Plus size={18} /> Add Exam Questions</button>
        </div>

        <div style={{ borderTop: '2px solid #000000', paddingTop: '1rem', overflowX: 'auto' }}>
          {submissions.length > 0 ? (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #000000', fontSize: '1rem', color: '#000000', fontFamily: 'var(--font-heading)' }}>
                    {['S/N', 'Time', 'Name', 'Score', 'Church', 'Category', 'Warnings', 'Duration', 'Action'].map(h => (
                      <th key={h} style={{ padding: '1rem 0.5rem', fontWeight: '800' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((sub, idx) => {
                    const u = userMap[sub.userId] || {};
                    return (
                      <tr key={sub.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#000000' }}>
                        <td style={{ padding: '1rem 0.5rem' }}>{(submissionPage - 1) * itemsPerPage + idx + 1}</td>
                        <td style={{ padding: '1rem', color: '#475569' }}>{formatTime(sub.submittedAt)}</td>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>{sub.userName}</td>
                        <td style={{ padding: '1rem', fontWeight: '700' }}>{sub.scorePercentage}%</td>
                        <td style={{ padding: '1rem', color: '#475569' }}>{u.church || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', backgroundColor: 'rgba(10,17,65,0.08)', color: '#0a1141' }}>
                            {getRankLabel(u.rankCategory)}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontWeight: '600', color: getInfractionColor(sub.warningsCount) }}>
                            {sub.warningsCount} / 3
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#475569' }}>{formatDuration(sub.durationSpent)}</td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => handleRevokeSubmission(sub.id, sub.userName)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'transparent', border: '1px solid rgba(202,138,4,0.35)', color: '#ca8a04', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                            title="Revoke this submission (allows re-attempt)"
                          >
                            <RotateCcw size={13} /> Revoke
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <PaginationControls page={submissionPage} total={totalPages} onPrev={() => setSubmissionPage(p => Math.max(1, p - 1))} onNext={() => setSubmissionPage(p => Math.min(totalPages, p + 1))} />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontStyle: 'italic' }}>No exam submissions recorded yet.</div>
          )}
        </div>
      </div>
    );
  }

  // ── LEADERBOARD TAB ────────────────────────────────────────────────────────
  if (currentTab === 'leaderboard') {
    const allExams = dbService.getExams();

    const handleDownloadLeaderboard = () => {
      if (submissions.length === 0) { alert('No submissions to download.'); return; }
      const sorted = [...submissions].sort((a, b) => b.scorePercentage - a.scorePercentage);
      let csv = 'data:text/csv;charset=utf-8,Rank,Name,Score,Church,Category,Warnings,Time Spent\n';
      sorted.forEach((sub, i) => {
        const u = userMap[sub.userId] || {};
        csv += `${i + 1},${(sub.userName || '').replace(/,/g, '')},${sub.scorePercentage}%,${(u.church || 'N/A').replace(/,/g, '')},${getRankLabel(u.rankCategory)},${sub.warningsCount},${formatDuration(sub.durationSpent)}\n`;
      });
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = `RALWBC_Leaderboard_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    return (
      <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', minHeight: '80vh' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#000000' }}>Leaderboard</h1>
            <p style={{ color: '#475569', fontSize: '0.95rem' }}>Rankings by score — sorted per exam category.</p>
          </div>
          <button onClick={handleDownloadLeaderboard} style={{ ...goldBtnStyle }}><Download size={18} /> Export Leaderboard</button>
        </div>

        {RANK_CATEGORIES.map(cat => {
          const catSubs = submissions
            .filter(sub => {
              const u = userMap[sub.userId] || {};
              return u.rankCategory === cat.value;
            })
            .sort((a, b) => b.scorePercentage - a.scorePercentage);

          if (catSubs.length === 0) return null;

          return (
            <div key={cat.value} style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #0a1141' }}>
                <Trophy size={20} color="#ca8a04" />
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0a1141', margin: 0 }}>{cat.label}</h2>
                <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700', backgroundColor: 'rgba(10,17,65,0.08)', color: '#0a1141' }}>
                  {catSubs.length} submission{catSubs.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ fontSize: '0.85rem', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                      {['Pos', 'Name', 'Score', 'Church', 'Warnings', 'Duration'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 0.5rem', fontWeight: '700', textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {catSubs.map((sub, idx) => {
                      const u = userMap[sub.userId] || {};
                      const pos = idx + 1;
                      const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : null;
                      const isTop3 = pos <= 3;
                      return (
                        <tr key={sub.id} style={{
                          borderBottom: '1px solid #e2e8f0', fontSize: '0.92rem',
                          backgroundColor: isTop3 ? (pos === 1 ? 'rgba(234,179,8,0.06)' : pos === 2 ? 'rgba(148,163,184,0.06)' : 'rgba(180,83,9,0.04)') : 'transparent'
                        }}>
                          <td style={{ padding: '1rem 0.5rem', fontWeight: '800', fontSize: '1.1rem' }}>
                            {medal ? <span title={`Position ${pos}`}>{medal}</span> : <span style={{ color: '#64748b' }}>#{pos}</span>}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: isTop3 ? '700' : '500', color: '#000000' }}>{sub.userName}</td>
                          <td style={{ padding: '1rem', fontWeight: '800', fontSize: '1.05rem', color: sub.scorePercentage >= 70 ? '#16a34a' : sub.scorePercentage >= 50 ? '#ca8a04' : '#ef4444' }}>
                            {sub.scorePercentage}%
                          </td>
                          <td style={{ padding: '1rem', color: '#475569' }}>{u.church || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ fontWeight: '600', color: getInfractionColor(sub.warningsCount) }}>
                              {sub.warningsCount} / 3
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: '#475569' }}>{formatDuration(sub.durationSpent)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {submissions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontStyle: 'italic' }}>
            No submissions yet. The leaderboard will populate once candidates complete their exams.
          </div>
        )}
      </div>
    );
  }

  // ── DASHBOARD OVERVIEW ─────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#000000' }}>Committee Dashboard</h1>
        <p style={{ color: '#475569', fontSize: '1rem', marginTop: '0.25rem' }}>
          Host examinations, score results, edit church resources, and manage active officers.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: 'Candidates', value: stats.totalUsers, icon: <Users size={24} />, color: '#0a1141', bg: 'rgba(10,17,65,0.08)' },
          { label: 'Submissions', value: stats.totalSubs, icon: <ClipboardList size={24} />, color: '#ca8a04', bg: 'rgba(202,138,4,0.08)' },
          { label: 'Average Score', value: `${stats.averageScore}%`, icon: <Award size={24} />, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Warnings Flagged', value: stats.totalInfractions, icon: <ShieldAlert size={24} />, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
          { label: 'Conference Officers', value: stats.totalOfficers, icon: <UserCheck size={24} />, color: '#9333ea', bg: 'rgba(147,51,234,0.08)' }
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} style={cardStyle}>
            <div style={{ ...iconWrapperStyle, backgroundColor: bg, color }}>{icon}</div>
            <div>
              <div style={cardLabelStyle}>{label}</div>
              <div style={cardValueStyle}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', backgroundColor: '#f8fafc', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#000000' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/admin?tab=candidates" style={shortcutBtnStyle}><Users size={16} /> View Candidates</Link>
          <Link to="/admin?tab=exams" style={shortcutBtnStyle}><FileSpreadsheet size={16} /> View Submissions</Link>
          <Link to="/admin?tab=leaderboard" style={shortcutBtnStyle}><Trophy size={16} /> Leaderboard</Link>
          <Link to="/admin/exams" style={shortcutBtnStyle}><Settings size={16} /> Manage Quizzes</Link>
          <Link to="/admin/officers" style={shortcutBtnStyle}><UserCheck size={16} /> Manage Officers</Link>
          <Link to="/admin/blogs" style={{ ...shortcutBtnStyle, backgroundColor: '#0a1141', color: '#ffffff' }}><PlusCircle size={16} /> Post Announcement</Link>
        </div>
      </div>

      {/* Session Settings Panel */}
      <div style={{ border: '2px solid #0a1141', borderRadius: '12px', padding: '2rem', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <CalendarClock size={22} color="#0a1141" />
          <h3 style={{ fontSize: '1.25rem', color: '#000000', margin: 0 }}>Camping / Exam Session Window</h3>
          <span style={{
            marginLeft: 'auto', padding: '0.3rem 0.85rem', borderRadius: '999px',
            fontSize: '0.78rem', fontWeight: '700',
            backgroundColor: dbService.isSessionActive() ? 'rgba(16,185,129,0.12)' : 'rgba(234,179,8,0.12)',
            color: dbService.isSessionActive() ? '#059669' : '#b45309',
            border: `1px solid ${dbService.isSessionActive() ? 'rgba(16,185,129,0.3)' : 'rgba(234,179,8,0.3)'}`
          }}>
            {dbService.isSessionActive() ? '● Portal Open' : '● Portal Closed'}
          </span>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          Set the start and end dates for the camping/exam session. Students can only access and start exams within this window.
          You can also manually force the portal open or closed using the toggle below.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Session Start Date', key: 'startDate' },
            { label: 'Session End Date', key: 'endDate' }
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
              <input type="date" value={session[key]}
                onChange={(e) => setSession(s => ({ ...s, [key]: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>

        <div
          onClick={() => setSession(s => ({ ...s, isOpen: !s.isOpen }))}
          style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem 1.25rem', borderRadius: '8px',
            backgroundColor: session.isOpen ? 'rgba(16,185,129,0.06)' : '#f8fafc',
            border: `1px solid ${session.isOpen ? 'rgba(16,185,129,0.25)' : '#e2e8f0'}`,
            marginBottom: '1.5rem', cursor: 'pointer'
          }}
        >
          {session.isOpen ? <ToggleRight size={28} color="#10b981" /> : <ToggleLeft size={28} color="#94a3b8" />}
          <div>
            <p style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a', margin: 0 }}>
              {session.isOpen ? 'Portal Manually Forced OPEN' : 'Portal Follows Date Schedule'}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, marginTop: '0.1rem' }}>
              {session.isOpen ? 'Toggle OFF to let the date window control access.' : 'Toggle ON to open the portal immediately, regardless of dates.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={handleSaveSession} style={{ ...navyBtnStyle }}>
            <Save size={16} /> Save Session Settings
          </button>
          {sessionSaved && <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>✓ Saved successfully!</span>}
        </div>
      </div>
    </div>
  );
};

// ── Reusable Pagination Component ──────────────────────────────────────────────
const PaginationControls = ({ page, total, onPrev, onNext }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
    <button style={{ ...arrowButtonStyle, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }} disabled={page === 1} onClick={onPrev}>‹</button>
    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.25rem 0.75rem', backgroundColor: '#ffffff' }}>
      <span style={{ fontSize: '0.85rem', color: '#000000', fontWeight: '500' }}>Page {String(page).padStart(2, '0')} of {String(total).padStart(2, '0')}</span>
    </div>
    <button style={{ ...arrowButtonStyle, opacity: page === total ? 0.5 : 1, cursor: page === total ? 'not-allowed' : 'pointer' }} disabled={page === total} onClick={onNext}>›</button>
  </div>
);

// ── Shared Styles ──────────────────────────────────────────────────────────────
const cardStyle = { border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const iconWrapperStyle = { padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardLabelStyle = { color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' };
const cardValueStyle = { fontSize: '1.6rem', fontWeight: '800', color: '#000000', marginTop: '0.25rem' };
const shortcutBtnStyle = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' };
const arrowButtonStyle = { border: '1px solid #e2e8f0', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#64748b', fontSize: '1rem', lineHeight: 1 };
const goldBtnStyle = { backgroundColor: '#eab308', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.8rem 1.75rem', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 8px rgba(234,179,8,0.2)' };
const navyBtnStyle = { backgroundColor: '#0a1141', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.8rem 1.75rem', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 8px rgba(10,17,65,0.2)' };

export default AdminDashboard;
