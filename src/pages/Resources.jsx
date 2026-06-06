import React from 'react';
import { Download, FileText, FileSpreadsheet, BookOpen, AlertCircle } from 'lucide-react';

const STUDY_RESOURCES = [
  {
    id: 1,
    title: "Royal Ambassadors Manual (2026 Edition)",
    description: "The primary reference handbook containing standard RA regulations, ranking milestones, and history.",
    size: "4.8 MB",
    format: "PDF"
  },
  {
    id: 2,
    title: "Annual Quiz Scripture Syllabus & Study Guide",
    description: "Contains designated chapters of study from both Old & New Testaments, along with sample questions.",
    size: "1.2 MB",
    format: "PDF"
  },
  {
    id: 3,
    title: "Baptist Youth Discipleship Guidebook",
    description: "Selected Christian doctrines, history of the Baptist Convention, and regional missional guides.",
    size: "2.5 MB",
    format: "PDF"
  },
  {
    id: 4,
    title: "Past Questions Repository (2023 - 2025)",
    description: "A compiled sheet containing actual quiz questions and answers from past conference championships.",
    size: "850 KB",
    format: "PDF"
  }
];

export const Resources = () => {
  const handleDownload = (title) => {
    alert(`Downloading mock file: "${title}"\n(This is a local demonstration download link).`);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '3.5rem 0' }}>
      <section className="container" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Study Resources</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
          Download study materials, past exam questions, manuals, and scripture breakdowns to prepare for the annual Bible Quiz.
        </p>
      </section>

      {/* Advisory Alert */}
      <section className="container" style={{ maxWidth: '800px', marginBottom: '3rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid rgba(234, 179, 8, 0.2)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          color: '#fde047',
          fontSize: '0.9rem',
          alignItems: 'flex-start'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <span style={{ fontWeight: 'bold' }}>Important Preparation Notice:</span> All exam questions will be strictly sourced from the study guides provided below. Ensure you review the RA Manual ranking questions and scripture passages before logging in to sit the exam.
          </div>
        </div>
      </section>

      {/* Download Items Grid */}
      <section className="container" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {STUDY_RESOURCES.map(resource => (
            <div 
              key={resource.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.75rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '1.5rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flex: '1 1 auto' }}>
                <div style={{
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <FileText size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    {resource.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    {resource.description}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    <span className="badge badge-primary">{resource.format}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{resource.size}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleDownload(resource.title)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
              >
                <Download size={14} /> Download
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
