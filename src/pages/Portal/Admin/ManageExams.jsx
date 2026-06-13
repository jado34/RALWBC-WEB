import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService, RANK_CATEGORIES } from '../../../services/db';
import { Plus, Trash2, ArrowLeft, Save, Edit3, Image as ImageIcon, CheckCircle } from 'lucide-react';

export const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [editingExam, setEditingExam] = useState(null); // Exam details object
  const [wizardStep, setWizardStep] = useState('details'); // 'details' or 'questions'
  const [currentQIndex, setCurrentQIndex] = useState(0); // Current question wizard index
  const navigate = useNavigate();

  const loadExams = async () => {
    try {
      const data = await dbService.getExams();
      setExams(data);
    } catch (err) {
      console.error('Failed to load exams:', err);
    }
  };

  useEffect(() => {
    dbService.init();
    loadExams();
  }, []);

  const handleStartCreate = () => {
    setEditingExam({
      title: "",
      description: "",
      category: 'ambassador',
      duration: 30,
      isActive: true,
      questions: [
        {
          id: "q_" + Math.random().toString(36).substr(2, 9),
          text: "",
          options: ["", "", "", ""],
          optionImages: ["", "", "", ""], // compressed base64 images per option
          correctAnswer: ""
        }
      ]
    });
    setWizardStep('details');
    setCurrentQIndex(0);
  };

  const handleStartEdit = (exam) => {
    setEditingExam(JSON.parse(JSON.stringify(exam)));
    setWizardStep('details');
    setCurrentQIndex(0);
  };

  const handleDeleteExam = async (id) => {
    if (window.confirm("Are you sure you want to delete this exam? All candidate exam results might be orphaned!")) {
      try {
        await dbService.deleteExam(id);
        loadExams();
      } catch (err) {
        console.error('Failed to delete exam:', err);
      }
    }
  };

  // Field change handlers
  const handleExamChange = (field, value) => {
    setEditingExam(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionTextChange = (text) => {
    const updated = [...editingExam.questions];
    updated[currentQIndex].text = text;
    setEditingExam(prev => ({ ...prev, questions: updated }));
  };

  const handleOptionChange = (optIdx, val) => {
    const updated = [...editingExam.questions];
    updated[currentQIndex].options[optIdx] = val;
    setEditingExam(prev => ({ ...prev, questions: updated }));
  };

  const handleCorrectAnswerSelect = (optionText) => {
    if (!optionText.trim()) {
      alert("Please enter text for this option before marking it as correct.");
      return;
    }
    const updated = [...editingExam.questions];
    updated[currentQIndex].correctAnswer = optionText;
    setEditingExam(prev => ({ ...prev, questions: updated }));
  };

  // Canvas Image Downscaler for options
  const handleOptionImageUpload = (e, optIdx) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64Jpeg = canvas.toDataURL('image/jpeg', 0.8);

        const updated = [...editingExam.questions];
        if (!updated[currentQIndex].optionImages) {
          updated[currentQIndex].optionImages = ["", "", "", ""];
        }
        updated[currentQIndex].optionImages[optIdx] = base64Jpeg;
        setEditingExam(prev => ({ ...prev, questions: updated }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removeOptionImage = (optIdx) => {
    const updated = [...editingExam.questions];
    updated[currentQIndex].optionImages[optIdx] = "";
    setEditingExam(prev => ({ ...prev, questions: updated }));
  };

  // Wizard transitions
  const handleProceedToQuestions = () => {
    if (!editingExam.title.trim()) {
      alert("Please enter an Exam Title first.");
      return;
    }
    setWizardStep('questions');
  };

  const handlePreviousAction = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    } else {
      setWizardStep('details');
    }
  };

  const handleSaveAndNext = () => {
    const q = editingExam.questions[currentQIndex];
    if (!q.text.trim()) {
      alert("Question content is empty!");
      return;
    }
    if (q.options.some(o => !o.trim())) {
      alert("Please enter values for all 4 options.");
      return;
    }
    if (!q.correctAnswer) {
      alert("Please select the correct answer checkmark.");
      return;
    }

    // If it's the last question, create a new one
    if (currentQIndex === editingExam.questions.length - 1) {
      const newQuestion = {
        id: "q_" + Math.random().toString(36).substr(2, 9),
        text: "",
        options: ["", "", "", ""],
        optionImages: ["", "", "", ""],
        correctAnswer: ""
      };
      setEditingExam(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
    }

    setCurrentQIndex(currentQIndex + 1);
    // Scroll back to top of question editor when moving to the next question
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAndExit = async () => {
    // Validations
    if (!editingExam.title.trim()) {
      alert("Exam Title is required!");
      return;
    }

    // Clean up empty questions at the end if the admin didn't fill them
    let questionsToSave = [...editingExam.questions];
    if (questionsToSave.length > 1) {
      const lastQ = questionsToSave[questionsToSave.length - 1];
      if (!lastQ.text.trim() && lastQ.options.every(o => !o.trim())) {
        questionsToSave.pop();
      }
    }

    // Full validation
    for (let i = 0; i < questionsToSave.length; i++) {
      const q = questionsToSave[i];
      if (!q.text.trim()) {
        alert(`Question #${i + 1} content is empty!`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`Question #${i + 1} has empty options!`);
        return;
      }
      if (!q.correctAnswer) {
        alert(`Please select the correct answer for Question #${i + 1}!`);
        return;
      }
    }

    let clampedDuration = parseInt(editingExam.duration);
    if (isNaN(clampedDuration) || clampedDuration < 5) clampedDuration = 5;
    if (clampedDuration > 180) clampedDuration = 180;

    const updatedExam = { ...editingExam, duration: clampedDuration, questions: questionsToSave };
    try {
      await dbService.saveExam(updatedExam);
      setEditingExam(null);
      loadExams();
    } catch (err) {
      console.error('Failed to save exam:', err);
    }
  };

  const handleDeleteQuestion = (idxToDelete) => {
    if (editingExam.questions.length <= 1) {
      alert("Exams must have at least one question!");
      return;
    }
    if (window.confirm(`Are you sure you want to delete Question #${idxToDelete + 1}?`)) {
      const updated = editingExam.questions.filter((_, idx) => idx !== idxToDelete);
      setEditingExam(prev => ({ ...prev, questions: updated }));
      if (currentQIndex >= updated.length) {
        setCurrentQIndex(updated.length - 1);
      } else if (currentQIndex === idxToDelete && currentQIndex > 0) {
        setCurrentQIndex(currentQIndex - 1);
      }
    }
  };

  const handleAddNewQuestion = () => {
    const newQuestion = {
      id: "q_" + Math.random().toString(36).substr(2, 9),
      text: "",
      options: ["", "", "", ""],
      optionImages: ["", "", "", ""],
      correctAnswer: ""
    };
    setEditingExam(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setCurrentQIndex(editingExam.questions.length);
  };

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', minHeight: '80vh' }}>

      {/* Top Header */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2.5rem' }}>
        {editingExam ? (
          <button
            onClick={() => {
              if (window.confirm("Exit editor? Unsaved changes will be lost.")) {
                setEditingExam(null);
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <ArrowLeft size={16} /> Back to Quizzes
          </button>
        ) : (
          <button onClick={() => navigate('/admin')} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowLeft size={16} /> Back to Admin
          </button>
        )}
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#000000', margin: 0 }}>
          {editingExam ? (editingExam.id ? "Edit Exam" : "Create Exam") : "Manage Exams"}
        </h1>
      </div>

      {editingExam ? (
        wizardStep === 'details' ? (
          /* Step 1: General Exam Details Form */
          <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '800px', backgroundColor: '#ffffff' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#0a1141', marginBottom: '1.5rem', fontWeight: '700' }}>General Details</h2>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Exam Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Ambassadors Senior Ranking Exam"
                value={editingExam.title}
                onChange={(e) => handleExamChange('title', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Instructions / Description</label>
              <textarea
                rows="4"
                placeholder="Write specific details, instructions, chapters covered, and rules..."
                value={editingExam.description}
                onChange={(e) => handleExamChange('description', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Rank Category</label>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', marginTop: '-0.25rem' }}>
                Ambassadors will only see this exam if their registered rank matches this category.
              </p>
              <select
                value={editingExam.category || 'ambassador'}
                onChange={(e) => handleExamChange('category', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {RANK_CATEGORIES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label style={labelStyle}>Duration (in minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  required
                  value={editingExam.duration}
                  onChange={(e) => handleExamChange('duration', parseInt(e.target.value) || 30)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={editingExam.isActive}
                    onChange={(e) => handleExamChange('isActive', e.target.checked)}
                    style={{ width: '1.25rem', height: '1.25rem', accentColor: '#0a1141' }}
                  />
                  <span>Active &amp; Live (Candidates can access it)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={editingExam.registrationOpen !== false}
                    onChange={(e) => handleExamChange('registrationOpen', e.target.checked)}
                    style={{ width: '1.25rem', height: '1.25rem', accentColor: '#16a34a' }}
                  />
                  <span style={{ color: editingExam.registrationOpen !== false ? '#16a34a' : '#ef4444' }}>
                    Registration Open
                  </span>
                </label>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Registration Deadline (optional)</label>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', marginTop: '-0.25rem' }}>
                After this date/time, no new enrollments can be made. Leave blank for no deadline.
              </p>
              <input
                type="datetime-local"
                value={editingExam.registrationDeadline ? editingExam.registrationDeadline.replace('Z', '') : ''}
                onChange={(e) => handleExamChange('registrationDeadline', e.target.value ? new Date(e.target.value).toISOString() : null)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <button type="button" onClick={() => setEditingExam(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToQuestions}
                style={{
                  backgroundColor: '#0a1141',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 2rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Proceed to Questions
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Wizard Question Editor View with Sidebar Navigator (Matches Image 4 Layout) */
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start', width: '100%' }}>

            {/* Sidebar Navigator */}
            <div style={{
              width: '260px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              maxHeight: '650px',
              overflowY: 'auto',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0a1141', margin: 0 }}>Questions ({editingExam.questions.length})</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {editingExam.questions.map((q, idx) => {
                  const isActive = idx === currentQIndex;
                  const snippet = q.text.trim() ? (q.text.length > 25 ? q.text.substring(0, 25) + '...' : q.text) : '(Empty question)';
                  return (
                    <div
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        backgroundColor: isActive ? '#0a1141' : '#ffffff',
                        color: isActive ? '#ffffff' : '#000000',
                        border: '1px solid',
                        borderColor: isActive ? '#0a1141' : '#cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', overflow: 'hidden', marginRight: '0.5rem', flex: 1 }}>
                        <span style={{ fontWeight: '700', fontSize: '0.75rem', color: isActive ? '#eab308' : '#64748b' }}>
                          Question {idx + 1}
                        </span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {snippet}
                        </span>
                      </div>

                      {editingExam.questions.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(idx);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isActive ? '#fca5a5' : '#ef4444',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Delete question"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAddNewQuestion}
                style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: '#0a1141',
                  border: '2px dashed #0a1141',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0a1141';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#0a1141';
                }}
              >
                <Plus size={16} /> Add Question
              </button>
            </div>

            {/* Main Question Editor (Right Side) */}
            <div style={{ flex: 1, minWidth: '320px', maxWidth: '850px' }}>

              {/* Header info bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#000000', margin: 0 }}>
                  {currentQIndex < (editingExam?.questions?.length ?? 0) - 1 || (editingExam?.questions?.[currentQIndex]?.text?.trim()) ? 'Edit Question' : 'Add Question'}
                </h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#64748b' }}>
                    Question {currentQIndex + 1} of {editingExam.questions.length}
                  </span>
                  <button
                    onClick={() => handleDeleteQuestion(currentQIndex)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                    title="Remove this question"
                  >
                    <Trash2 size={16} /> Delete Question
                  </button>
                </div>
              </div>

              {/* Question Text Area Box (Image 4 Style) */}
              <div style={{ marginBottom: '2rem' }}>
                <textarea
                  value={editingExam.questions[currentQIndex]?.text || ''}
                  onChange={(e) => handleQuestionTextChange(e.target.value)}
                  placeholder="The current Marshal of RAN is..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    backgroundColor: '#f1f5f9', // faint grey box
                    border: 'none',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#000000',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'var(--font-body)'
                  }}
                />
              </div>

              {/* Option boxes list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                {(editingExam.questions[currentQIndex]?.options || ["", "", "", ""]).map((option, optIdx) => {
                  const isSelected = editingExam.questions[currentQIndex].correctAnswer === option && option.trim() !== '';
                  const currentOptImg = editingExam.questions[currentQIndex].optionImages?.[optIdx] || '';

                  return (
                    <div
                      key={optIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem 1.25rem',
                        border: isSelected ? '2px solid #16a34a' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#f0fdf4' : '#f8fafc',
                        borderRadius: '8px',
                        transition: 'all 0.15s'
                      }}
                    >
                      {/* Left: Custom checkmark status indicator */}
                      <div
                        onClick={() => handleCorrectAnswerSelect(option)}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#16a34a' : '#cbd5e1',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        title="Select as correct answer"
                      >
                        ✓
                      </div>

                      {/* Middle: Option input field */}
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        value={option}
                        onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          fontSize: '1rem',
                          color: '#000000',
                          fontWeight: isSelected ? '700' : '500',
                          fontFamily: 'var(--font-body)'
                        }}
                      />

                      {/* Image preview (if uploaded) */}
                      {currentOptImg && (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <img
                            src={currentOptImg}
                            alt="option upload"
                            style={{ height: '36px', maxWidth: '60px', borderRadius: '4px', objectFit: 'contain', border: '1px solid #cbd5e1' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeOptionImage(optIdx)}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: '#ef4444',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '9px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Right: Image attachment trigger */}
                      <label style={{ cursor: 'pointer', padding: '0.25rem', color: '#64748b' }} title="Attach image option">
                        <ImageIcon size={20} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleOptionImageUpload(e, optIdx)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Wizard Buttons Footer (Previous (Gold), Save & Next (Navy), Save & Exit (Green)) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '2rem'
              }}>
                {/* Previous button (Gold) */}
                <button
                  onClick={handlePreviousAction}
                  style={{
                    backgroundColor: '#eab308', // Gold
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.85rem 2.25rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(234,179,8,0.2)'
                  }}
                >
                  Previous
                </button>

                {/* Middle Right: Save & Next (Navy) + Save & Exit (Green) */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {/* Save & Next (Navy) */}
                  <button
                    onClick={handleSaveAndNext}
                    style={{
                      backgroundColor: '#0a1141', // Navy
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.85rem 2.25rem',
                      fontSize: '1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(10,17,65,0.2)'
                    }}
                  >
                    Save & Next
                  </button>

                  {/* Save & Exit (Green) */}
                  <button
                    onClick={handleSaveAndExit}
                    style={{
                      backgroundColor: '#16a34a', // Green
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.85rem 2.25rem',
                      fontSize: '1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(22,163,74,0.2)'
                    }}
                  >
                    Save & Exit
                  </button>
                </div>
              </div>

            </div>

          </div>
        )
      ) : (
        /* Exams Catalog Listing view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#ffffff' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#000000', margin: 0 }}>Active Exam Catalogs</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>Create and configure exams for the conference candidates.</p>
            </div>
            <button onClick={handleStartCreate} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#0a1141', color: '#ffffff' }}>
              <Plus size={16} /> Create New Exam
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {exams.length > 0 ? (
              exams.map(exam => (
                <div key={exam.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#ffffff' }}>
                  <div style={{ flex: '1 1 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.25rem', color: '#000000', margin: 0 }}>{exam.title}</h3>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        fontWeight: '700',
                        backgroundColor: exam.isActive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: exam.isActive ? '#16a34a' : '#ef4444'
                      }}>
                        {exam.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        fontWeight: '700',
                        backgroundColor: 'rgba(10, 17, 65, 0.08)',
                        color: '#0a1141'
                      }}>
                        {RANK_CATEGORIES.find(r => r.value === exam.category)?.label || 'Ambassador'}
                      </span>
                    </div>
                    <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.5rem', maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {exam.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <span>Questions: <strong>{exam.questions.length} items</strong></span>
                      <span>&bull;</span>
                      <span>Duration: <strong>{exam.duration}m</strong></span>
                      <span>&bull;</span>
                      <span>Category: <strong>{RANK_CATEGORIES.find(r => r.value === exam.category)?.label || 'Ambassador'}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                    <button onClick={() => handleStartEdit(exam)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Edit3 size={14} /> Edit
                    </button>
                    <button onClick={() => handleDeleteExam(exam.id)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff' }}>
                No exams created yet. Click "Create New Exam" above to start.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

// Styles
const labelStyle = {
  display: 'block',
  fontSize: '0.9rem',
  fontWeight: '700',
  color: '#000000',
  marginBottom: '0.5rem',
  fontFamily: 'var(--font-heading)'
};

const inputStyle = {
  width: '100%',
  padding: '0.85rem 1.25rem',
  backgroundColor: '#f1f5f9',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  color: '#000000',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'var(--font-body)'
};

export default ManageExams;
