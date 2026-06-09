import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../../../services/db';
import { Plus, Trash2, ArrowLeft, Save, Edit3, Newspaper } from 'lucide-react';

export const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const navigate = useNavigate();

  const loadBlogs = async () => {
    try {
      const data = await dbService.getBlogs();
      setBlogs(data);
    } catch (err) {
      console.error('Failed to load blogs:', err);
    }
  };

  useEffect(() => {
    dbService.init();
    loadBlogs();
  }, []);

  const handleStartCreate = () => {
    setEditingBlog({
      title: "",
      content: "",
      author: "Exam Committee"
    });
  };

  const handleStartEdit = (blog) => {
    setEditingBlog({ ...blog });
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await dbService.deleteBlog(id);
        loadBlogs();
      } catch (err) {
        console.error('Failed to delete blog:', err);
      }
    }
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!editingBlog.title.trim() || !editingBlog.content.trim()) {
      alert("Please fill in both the title and the content!");
      return;
    }

    try {
      await dbService.saveBlog(editingBlog);
      setEditingBlog(null);
      loadBlogs();
    } catch (err) {
      console.error('Failed to save blog:', err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '3rem 0' }}>
      <section className="container" style={{ maxWidth: '800px' }}>
        {/* Header navigation */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
          {editingBlog ? (
            <button onClick={() => setEditingBlog(null)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={16} /> Back to List
            </button>
          ) : (
            <button onClick={() => navigate('/admin')} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={16} /> Back to Admin
            </button>
          )}
          <h1 style={{ fontSize: '1.8rem' }}>
            {editingBlog ? (editingBlog.id ? "Edit Announcement" : "Create Announcement") : "Manage Announcements"}
          </h1>
        </div>

        {editingBlog ? (
          /* Create/Edit Blog Form */
          <form onSubmit={handleSaveBlog} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="blog-title-input">Announcement Title</label>
              <input 
                id="blog-title-input"
                type="text"
                required
                placeholder="e.g. Schedule for Bible Quiz Mock Exam"
                value={editingBlog.title}
                onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="blog-author-input">Publisher / Author</label>
              <input 
                id="blog-author-input"
                type="text"
                required
                placeholder="e.g. Exam Committee"
                value={editingBlog.author}
                onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="blog-content-input">Content body</label>
              <textarea 
                id="blog-content-input"
                rows="8"
                required
                placeholder="Type the announcement announcement details here..."
                value={editingBlog.content}
                onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                className="form-input"
                style={{ resize: 'vertical', lineHeight: '1.6' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setEditingBlog(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Save size={18} /> Publish Post
              </button>
            </div>
          </form>
        ) : (
          /* Blogs list */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifySpace: 'between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem' }}>Published Announcements</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Write posts that appear on the public website home and blog pages.</p>
              </div>
              <button onClick={handleStartCreate} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                <Plus size={16} /> Write Announcement
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {blogs.length > 0 ? (
                blogs.map(blog => (
                  <div key={blog.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: '1 1 auto', maxWidth: '80%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Newspaper size={16} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Published on: <strong>{blog.date}</strong></span>
                        <span>&bull;</span>
                        <span>Author: <strong>{blog.author}</strong></span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                      <button onClick={() => handleStartEdit(blog)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Edit3 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDeleteBlog(blog.id)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No announcements published yet. Click "Write Announcement" above to start.
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
export default ManageBlogs;
