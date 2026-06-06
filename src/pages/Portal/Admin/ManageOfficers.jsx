import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../../../services/db';
import { Plus, Trash2, ArrowLeft, Save, Edit3, User, Upload, ArrowUp, ArrowDown } from 'lucide-react';

export const ManageOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    dbService.init();
    loadOfficers();
  }, []);

  const loadOfficers = () => {
    setOfficers(dbService.getOfficers());
  };

  const handleStartCreate = () => {
    setEditingOfficer({
      name: "",
      post: "",
      image: "",
      sortOrder: officers.length > 0 ? Math.max(...officers.map(o => o.sortOrder || 0)) + 1 : 1
    });
  };

  const handleStartEdit = (officer) => {
    setEditingOfficer({ ...officer });
  };

  const handleDeleteOfficer = (id) => {
    if (window.confirm("Are you sure you want to delete this officer from leadership?")) {
      dbService.deleteOfficer(id);
      loadOfficers();
    }
  };

  // Canvas compressor & cropping handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file!");
      return;
    }

    setIsCompressing(true);
    try {
      const base64Compressed = await compressAndResizeImage(file);
      setEditingOfficer(prev => ({ ...prev, image: base64Compressed }));
    } catch (err) {
      console.error(err);
      alert("Error resizing image: " + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const compressAndResizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // Enforce a 300x300 square crop (ideal for avatar cards)
          const targetSize = 300;
          canvas.width = targetSize;
          canvas.height = targetSize;
          
          // Calculate center cropping parameters (like object-fit: cover)
          const minDim = Math.min(img.width, img.height);
          const sourceWidth = minDim;
          const sourceHeight = minDim;
          const sourceX = (img.width - minDim) / 2;
          const sourceY = (img.height - minDim) / 2;
          
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            targetSize,
            targetSize
          );
          
          // Compress to JPEG format with 0.8 quality factor (~15KB)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error("Failed to load image resource"));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleSaveOfficer = (e) => {
    e.preventDefault();
    if (!editingOfficer.name.trim() || !editingOfficer.post.trim()) {
      alert("Please fill in both the Name and the Post/Office!");
      return;
    }

    dbService.saveOfficer(editingOfficer);
    setEditingOfficer(null);
    loadOfficers();
  };

  // Helper to render fallback user avatar
  const renderAvatarFallback = (name, size = 50) => {
    const initials = name
      ? name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'RA';
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'rgba(0, 32, 96, 0.08)',
        color: '#002060',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: size > 60 ? '1.5rem' : '0.95rem',
        border: '1px solid rgba(0, 32, 96, 0.15)'
      }}>
        {initials}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ padding: '3rem 0' }}>
      <section className="container" style={{ maxWidth: '800px' }}>
        {/* Header navigation */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
          {editingOfficer ? (
            <button onClick={() => setEditingOfficer(null)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={16} /> Back to List
            </button>
          ) : (
            <button onClick={() => navigate('/admin')} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={16} /> Back to Admin
            </button>
          )}
          <h1 style={{ fontSize: '1.8rem' }}>
            {editingOfficer ? (editingOfficer.id ? "Edit Officer" : "Add Officer") : "Manage Leadership Officers"}
          </h1>
        </div>

        {editingOfficer ? (
          /* Create/Edit Officer Form */
          <form onSubmit={handleSaveOfficer} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Image Upload section */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
              <div>
                {editingOfficer.image ? (
                  <img 
                    src={editingOfficer.image} 
                    alt="Officer Preview" 
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover',
                      border: '2px solid var(--primary-light)'
                    }}
                  />
                ) : (
                  renderAvatarFallback(editingOfficer.name, 120)
                )}
              </div>
              
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span className="form-label" style={{ marginBottom: 0 }}>Officer Photograph</span>
                <label className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', cursor: 'pointer', display: 'flex', gap: '0.4rem' }}>
                  <Upload size={14} />
                  {isCompressing ? "Processing..." : "Select File"}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }}
                    disabled={isCompressing}
                  />
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  JPEG or PNG image file. Recommended square aspect ratio. Images will be automatically cropped to 300x300 and compressed.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="officer-name-input">Officer Name</label>
              <input 
                id="officer-name-input"
                type="text"
                required
                placeholder="e.g. Coun. Olusegun Johnson"
                value={editingOfficer.name}
                onChange={(e) => setEditingOfficer({ ...editingOfficer, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="officer-post-input">Post / Title occupied</label>
              <input 
                id="officer-post-input"
                type="text"
                required
                placeholder="e.g. Conference RA Director"
                value={editingOfficer.post}
                onChange={(e) => setEditingOfficer({ ...editingOfficer, post: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="officer-sort-input">Display Hierarchy Sort Order</label>
              <input 
                id="officer-sort-input"
                type="number"
                required
                placeholder="e.g. 1"
                value={editingOfficer.sortOrder}
                onChange={(e) => setEditingOfficer({ ...editingOfficer, sortOrder: parseInt(e.target.value) || 0 })}
                className="form-input"
                style={{ maxWidth: '150px' }}
                min="1"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Used to order how officers display. Marshal or Director should have rank 1, President rank 2, etc. (Lowest numbers show first).
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setEditingOfficer(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Save size={18} /> Save Officer
              </button>
            </div>
          </form>
        ) : (
          /* Officers list view */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifySpace: 'between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem' }}>Registered Conference Officers</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage the profile photographs, names, and posts of the leadership crew.</p>
              </div>
              <button onClick={handleStartCreate} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                <Plus size={16} /> Add Officer
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {officers.length > 0 ? (
                officers.map(officer => (
                  <div key={officer.id} className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1 1 auto' }}>
                      <div style={{ flexShrink: 0 }}>
                        {officer.image ? (
                          <img 
                            src={officer.image} 
                            alt={officer.name} 
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: 'var(--radius-sm)',
                              objectFit: 'cover',
                              border: '1px solid rgba(255,255,255,0.08)'
                            }}
                          />
                        ) : (
                          renderAvatarFallback(officer.name, 56)
                        )}
                      </div>
                      
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{officer.name}</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: '500', marginTop: '0.1rem' }}>
                          {officer.post}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Sort Order Rank: <strong style={{ color: 'var(--text-secondary)' }}>{officer.sortOrder}</strong>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                      <button onClick={() => handleStartEdit(officer)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Edit3 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDeleteOfficer(officer.id)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No officers added yet. Click "Add Officer" above to create the conference leadership team.
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
export default ManageOfficers;
