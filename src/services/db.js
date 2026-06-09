import { supabase } from './supabaseClient';

// Rank categories — the three official RA exam tiers
export const RANK_CATEGORIES = [
  { value: 'ambassador', label: 'Ambassador' },
  { value: 'ambassador_extraordinary', label: 'Ambassador Extraordinary' },
  { value: 'ambassador_plenipotentiary', label: 'Ambassador Plenipotentiary' },
];

export const getRankLabel = (value) => {
  const found = RANK_CATEGORIES.find(r => r.value === value);
  return found ? found.label : (value || 'N/A');
};

export const GALLERY_CATEGORIES = [
  'Jamboore Experience',
  'RA Week Ushering In',
  'Convention - in - Session',
  'RALWBC Annual General Meeting',
  'RA Leadership Training Conference'
];

export const dbService = {
  // Initialize Database (no-op now since Supabase client is self-initializing)
  init() {
    console.log('Supabase Database Service initialized');
  },

  // ── Auth Operations ───────────────────────────────────────────────────────

  async register(name, email, password, meta = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'student',
          ...meta
        }
      }
    });
    if (error) throw error;
    if (!data.user) throw new Error('Registration failed');

    const profileFields = {
      id: data.user.id,
      name,
      role: 'student'
    };
    if (meta.dob !== undefined) profileFields.dob = meta.dob;
    if (meta.phone !== undefined) profileFields.phone = meta.phone;
    if (meta.phoneNumber !== undefined) profileFields.phone_number = meta.phoneNumber;
    if (meta.church !== undefined) profileFields.church = meta.church;
    if (meta.address !== undefined) profileFields.address = meta.address;
    if (meta.chapterName !== undefined) profileFields.chapter_name = meta.chapterName;
    if (meta.association !== undefined) profileFields.association = meta.association;
    if (meta.rankCategory !== undefined) profileFields.rank_category = meta.rankCategory;
    if (meta.rank !== undefined) profileFields.rank = meta.rank;

    // Robust fallback upsert in case SQL trigger is not yet executed/created
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileFields);
    if (profileError) {
      console.warn('Profile upsert fallback warning (might be handled by SQL trigger):', profileError);
    }

    return {
      id: data.user.id,
      name,
      email,
      role: 'student',
      ...meta
    };
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      const name = data.user.user_metadata?.name || email.split('@')[0];
      const role = data.user.user_metadata?.role || 'student';
      await supabase.from('profiles').upsert({ id: data.user.id, name, role });
      return { id: data.user.id, name, email, role };
    }

    return {
      id: profile.id,
      name: profile.name,
      email: data.user.email,
      role: profile.role,
      dob: profile.dob,
      phone: profile.phone || profile.phone_number,
      phoneNumber: profile.phone_number || profile.phone,
      church: profile.church,
      address: profile.address,
      chapterName: profile.chapter_name,
      association: profile.association,
      rankCategory: profile.rank_category,
      rank: profile.rank
    };
  },

  async updateUser(userId, fields) {
    const dbFields = {};
    if (fields.name !== undefined) dbFields.name = fields.name;
    if (fields.dob !== undefined) dbFields.dob = fields.dob;
    if (fields.phone !== undefined) dbFields.phone = fields.phone;
    if (fields.phoneNumber !== undefined) dbFields.phone_number = fields.phoneNumber;
    if (fields.church !== undefined) dbFields.church = fields.church;
    if (fields.address !== undefined) dbFields.address = fields.address;
    if (fields.chapterName !== undefined) dbFields.chapter_name = fields.chapterName;
    if (fields.association !== undefined) dbFields.association = fields.association;
    if (fields.rankCategory !== undefined) dbFields.rank_category = fields.rankCategory;
    if (fields.rank !== undefined) dbFields.rank = fields.rank;
    if (fields.role !== undefined) dbFields.role = fields.role;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbFields)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data ? {
      id: data.id,
      name: data.name,
      role: data.role,
      dob: data.dob,
      phone: data.phone,
      phoneNumber: data.phone_number,
      church: data.church,
      address: data.address,
      chapterName: data.chapter_name,
      association: data.association,
      rankCategory: data.rank_category,
      rank: data.rank
    } : null;
  },

  async updateUserPassword(userId, newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  },

  async deleteUser(userId) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (error) throw error;
  },

  // ── Exam Operations ───────────────────────────────────────────────────────

  async getExams() {
    const { data, error } = await supabase
      .from('exams')
      .select('*');
    if (error) throw error;
    return (data || []).map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      duration: e.duration,
      isActive: e.is_active,
      questions: e.questions
    }));
  },

  async getExamsByCategory(category) {
    const exams = await this.getExams();
    if (!category) return exams;
    return exams.filter(e => e.category === category);
  },

  async getExamById(id) {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      duration: data.duration,
      isActive: data.is_active,
      questions: data.questions
    } : null;
  },

  async saveExam(examData) {
    const dbExam = {
      title: examData.title,
      description: examData.description,
      category: examData.category,
      duration: examData.duration,
      is_active: examData.isActive !== undefined ? examData.isActive : true,
      questions: examData.questions || []
    };
    
    let id = examData.id;
    if (id) {
      const { error } = await supabase
        .from('exams')
        .update(dbExam)
        .eq('id', id);
      if (error) throw error;
    } else {
      id = 'exm_' + Math.random().toString(36).substr(2, 9);
      const { error } = await supabase
        .from('exams')
        .insert({ id, ...dbExam });
      if (error) throw error;
    }
    return { ...examData, id };
  },

  async deleteExam(id) {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ── Submission Operations ─────────────────────────────────────────────────

  async getSubmissions() {
    const { data, error } = await supabase
      .from('submissions')
      .select('*');
    if (error) throw error;
    return (data || []).map(s => ({
      id: s.id,
      userId: s.user_id,
      userName: s.user_name,
      examId: s.exam_id,
      examTitle: s.exam_title,
      answers: s.answers,
      correctCount: s.correct_count,
      totalQuestions: s.total_questions,
      scorePercentage: s.score_percentage,
      warningsCount: s.warnings_count,
      infractionLogs: s.infraction_logs,
      durationSpent: s.duration_spent,
      submittedAt: s.submitted_at
    }));
  },

  async getSubmissionsByUser(userId) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(s => ({
      id: s.id,
      userId: s.user_id,
      userName: s.user_name,
      examId: s.exam_id,
      examTitle: s.exam_title,
      answers: s.answers,
      correctCount: s.correct_count,
      totalQuestions: s.total_questions,
      scorePercentage: s.score_percentage,
      warningsCount: s.warnings_count,
      infractionLogs: s.infraction_logs,
      durationSpent: s.duration_spent,
      submittedAt: s.submitted_at
    }));
  },

  async getSubmissionForUserAndExam(userId, examId) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .maybeSingle();
    if (error) throw error;
    return data ? {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      examId: data.exam_id,
      examTitle: data.exam_title,
      answers: data.answers,
      correctCount: data.correct_count,
      totalQuestions: data.total_questions,
      scorePercentage: data.score_percentage,
      warningsCount: data.warnings_count,
      infractionLogs: data.infraction_logs,
      durationSpent: data.duration_spent,
      submittedAt: data.submitted_at
    } : null;
  },

  async deleteSubmission(submissionId) {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', submissionId);
    if (error) throw error;
  },

  async resetExamSubmissions(examId) {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('exam_id', examId);
    if (error) throw error;
  },

  async submitExam(userId, userName, examId, examTitle, answers, warningsCount, durationSpent, infractionLogs = []) {
    const exam = await this.getExamById(examId);
    if (!exam) throw new Error('Exam not found');

    const existing = await this.getSubmissionForUserAndExam(userId, examId);
    if (existing) throw new Error('You have already submitted this exam.');

    let correctCount = 0;
    const totalQuestions = exam.questions.length;
    exam.questions.forEach(q => {
      if (answers[q.id] && answers[q.id] === q.correctAnswer) correctCount++;
    });
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const submissionId = 'sub_' + Math.random().toString(36).substr(2, 9);
    const submission = {
      id: submissionId,
      user_id: userId,
      user_name: userName,
      exam_id: examId,
      exam_title: examTitle,
      answers,
      correct_count: correctCount,
      total_questions: totalQuestions,
      score_percentage: scorePercentage,
      warnings_count: warningsCount,
      infraction_logs: infractionLogs,
      duration_spent: durationSpent,
      submitted_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('submissions')
      .insert(submission);
    if (error) throw error;

    return {
      id: submissionId,
      userId,
      userName,
      examId,
      examTitle,
      answers,
      correctCount,
      totalQuestions,
      scorePercentage,
      warningsCount,
      infractionLogs,
      durationSpent,
      submittedAt: submission.submitted_at,
    };
  },

  // ── Blog Operations ───────────────────────────────────────────────────────

  async getBlogs() {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      date: b.date,
      content: b.content
    }));
  },

  async saveBlog(blogData) {
    const dbBlog = {
      title: blogData.title,
      author: blogData.author,
      content: blogData.content
    };
    
    let id = blogData.id;
    if (id) {
      const { error } = await supabase
        .from('blogs')
        .update(dbBlog)
        .eq('id', id);
      if (error) throw error;
    } else {
      id = 'blog_' + Math.random().toString(36).substr(2, 9);
      const { error } = await supabase
        .from('blogs')
        .insert({
          id,
          ...dbBlog,
          date: new Date().toISOString().split('T')[0]
        });
      if (error) throw error;
    }
    return { ...blogData, id, date: blogData.date || new Date().toISOString().split('T')[0] };
  },

  async deleteBlog(id) {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ── Officer Operations ────────────────────────────────────────────────────

  async getOfficers() {
    const { data, error } = await supabase
      .from('officers')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(o => ({
      id: o.id,
      name: o.name,
      post: o.post,
      image: o.image || '',
      sortOrder: o.sort_order
    }));
  },

  async saveOfficer(officerData) {
    const dbOfficer = {
      name: officerData.name,
      post: officerData.post,
      image: officerData.image || '',
      sort_order: Number(officerData.sortOrder) || 0
    };
    
    let id = officerData.id;
    if (id) {
      const { error } = await supabase
        .from('officers')
        .update(dbOfficer)
        .eq('id', id);
      if (error) throw error;
    } else {
      id = 'off_' + Math.random().toString(36).substr(2, 9);
      const { error } = await supabase
        .from('officers')
        .insert({ id, ...dbOfficer });
      if (error) throw error;
    }
    return { ...officerData, id };
  },

  async deleteOfficer(id) {
    const { error } = await supabase
      .from('officers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ── Gallery Operations ────────────────────────────────────────────────────

  async getGalleryPhotos() {
    const { data, error } = await supabase
      .from('gallery')
      .select('*');
    if (error) throw error;
    return (data || []).map(g => ({
      id: g.id,
      url: g.url,
      alt: g.alt || '',
      category: g.category
    }));
  },

  async saveGalleryPhoto(photoData) {
    const dbPhoto = {
      url: photoData.url,
      alt: photoData.alt || '',
      category: photoData.category
    };
    
    let id = photoData.id;
    if (id) {
      const { error } = await supabase
        .from('gallery')
        .update(dbPhoto)
        .eq('id', id);
      if (error) throw error;
    } else {
      id = 'gal_' + Math.random().toString(36).substr(2, 9);
      const { error } = await supabase
        .from('gallery')
        .insert({ id, ...dbPhoto });
      if (error) throw error;
    }
    return { ...photoData, id };
  },

  async deleteGalleryPhoto(id) {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ── Session / Camping Window Operations ──────────────────────────────────

  async getSession() {
    const { data, error } = await supabase
      .from('camping_session')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { startDate: null, endDate: null, startTime: '08:00', isOpen: false };
    return {
      startDate: data.start_date,
      endDate: data.end_date,
      startTime: data.start_time,
      isOpen: data.is_open
    };
  },

  async saveSession(sessionData) {
    const dbSession = {};
    if (sessionData.startDate !== undefined) dbSession.start_date = sessionData.startDate;
    if (sessionData.endDate !== undefined) dbSession.end_date = sessionData.endDate;
    if (sessionData.startTime !== undefined) dbSession.start_time = sessionData.startTime;
    if (sessionData.isOpen !== undefined) dbSession.is_open = sessionData.isOpen;

    const { error } = await supabase
      .from('camping_session')
      .upsert({ id: 1, ...dbSession });
    if (error) throw error;
    return this.getSession();
  },

  async isSessionActive() {
    const session = await this.getSession();
    if (session.isOpen) return true;
    if (!session.startDate || !session.endDate) return false;
    const now = new Date();
    const time = session.startTime || '08:00';
    const start = new Date(session.startDate + 'T' + time + ':00');
    const end = new Date(session.endDate + 'T23:59:59');
    return now >= start && now <= end;
  },

  async populateDemoData() {
    console.log('Seeding is done via the SQL Editor or direct updates');
  }
};
