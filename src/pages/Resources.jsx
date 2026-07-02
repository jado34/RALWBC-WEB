import React from 'react';
import { Download, FileText } from 'lucide-react';

const STUDY_RESOURCES = [
  {
    id: 1,
    title: "Royal Ambassadors Manual",
    description: "The primary reference handbook containing standard RA regulations, ranking milestones, and history. Published by the Nigeria Baptist Convention.",
    size: "0.4 MB",
    format: "PDF",
    file: "/RA-Manual.pdf",
    filename: "RA-Manual.pdf"
  }
];

export const Resources = () => {
  return (
    <div className="animate-fade-in" style={{ padding: '3.5rem 0' }}>
      <section className="container" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Official RA Resources</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
          Access official Royal Ambassadors reference materials to guide your growth, discipleship, and understanding of the RA programme.
        </p>
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

              <a
                href={resource.file}
                download={resource.filename}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, textDecoration: 'none' }}
              >
                <Download size={14} /> Download
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
