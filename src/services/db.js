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
  'RA Leadership Training Conference',
  'General Parade Rehearsal'
];

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

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
      role: 'student',
      email: email
    };
    if (meta.dob !== undefined) profileFields.dob = meta.dob || null;
    if (meta.phone !== undefined) profileFields.phone = meta.phone || null;
    if (meta.phoneNumber !== undefined) profileFields.phone_number = meta.phoneNumber || null;
    if (meta.church !== undefined) profileFields.church = meta.church;
    if (meta.address !== undefined) profileFields.address = meta.address;
    if (meta.chapterName !== undefined) profileFields.chapter_name = meta.chapterName;
    if (meta.association !== undefined) profileFields.association = meta.association;
    if (meta.rankCategory !== undefined) profileFields.rank_category = meta.rankCategory || null;
    if (meta.rank !== undefined) profileFields.rank = meta.rank;

    // Robust fallback upsert: try saving email as well.
    // If it fails (e.g. because 'email' column does not exist on profiles yet), retry without it.
    let { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileFields);
    if (profileError) {
      console.warn('Profile upsert with email failed, retrying without email:', profileError);
      delete profileFields.email;
      const { error: retryError } = await supabase
        .from('profiles')
        .upsert(profileFields);
      if (retryError) {
        console.warn('Profile upsert fallback retry failed:', retryError);
      }
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
    let loginData = null;
    let loginError = null;

    // 1. Try logging in with the exact password provided (handles admin case-sensitive passwords)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (!data.user) throw new Error('Login failed');
      loginData = data;
    } catch (err) {
      loginError = err;
    }

    // 2. If it failed and the password is not already lowercase, try with lowercase password (handles case-insensitive surname logins)
    if (loginError && password.toLowerCase() !== password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password.toLowerCase()
        });
        if (!error && data.user) {
          loginData = data;
          loginError = null; // Cleared error
        }
      } catch (err) {
        // Keep the original error
      }
    }

    // 3. If login still failed, check if they are an imported past candidate
    if (loginError) {
      try {
        const { data: imported, error: importErr } = await supabase
          .from('past_candidates')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (imported && !importErr) {
          const parts = String(imported.name || '').trim().split(/\s+/);
          const surname = parts.length > 1 ? parts[parts.length - 1] : parts[0];
          const expectedPassword = surname.toLowerCase();

          if (password.toLowerCase() === expectedPassword) {
            // Trigger registration with lowercase password
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password: expectedPassword,
              options: {
                data: {
                  name: imported.name,
                  role: 'student'
                }
              }
            });
            if (signUpError) throw signUpError;

            if (signUpData.user) {
              // Create active profile row with all imported details
              const newProfile = {
                id: signUpData.user.id,
                name: imported.name,
                role: 'student',
                church: imported.church,
                association: imported.association,
                rank_category: imported.rank_category,
                rank: imported.rank,
                phone: imported.phone
              };
              await supabase.from('profiles').upsert(newProfile);

              return {
                id: signUpData.user.id,
                name: imported.name,
                email: email,
                role: 'student',
                church: imported.church,
                association: imported.association,
                rankCategory: imported.rank_category,
                rank: imported.rank,
                phone: imported.phone,
                phoneNumber: imported.phone
              };
            }
          }
        }
      } catch (signupErr) {
        console.error('Dynamic signup failed:', signupErr);
      }
      throw loginError;
    }

    // 4. Fetch profile for the successfully logged-in user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      const name = loginData.user.user_metadata?.name || email.split('@')[0];
      const role = loginData.user.user_metadata?.role || 'student';
      await supabase.from('profiles').upsert({ id: loginData.user.id, name, role });
      return { id: loginData.user.id, name, email, role };
    }

    return {
      id: profile.id,
      name: profile.name,
      email: loginData.user.email,
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
    const dbFields = { id: userId };
    if (fields.name !== undefined) dbFields.name = fields.name;
    if (fields.dob !== undefined) dbFields.dob = fields.dob || null;
    if (fields.phone !== undefined) dbFields.phone = fields.phone || null;
    if (fields.phoneNumber !== undefined) dbFields.phone_number = fields.phoneNumber || null;
    if (fields.church !== undefined) dbFields.church = fields.church;
    if (fields.address !== undefined) dbFields.address = fields.address;
    if (fields.chapterName !== undefined) dbFields.chapter_name = fields.chapterName;
    if (fields.association !== undefined) dbFields.association = fields.association;
    if (fields.avatar !== undefined) dbFields.avatar = fields.avatar;
    if (fields.rankCategory !== undefined) dbFields.rank_category = fields.rankCategory || null;
    if (fields.rank !== undefined) dbFields.rank = fields.rank;
    if (fields.role !== undefined) dbFields.role = fields.role;
    if (fields.email !== undefined) dbFields.email = fields.email;

    // Use upsert instead of update to work with Supabase RLS policies
    let { data, error } = await supabase
      .from('profiles')
      .upsert(dbFields)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      // If upserting with email column failed (column may not exist), retry without it
      if (dbFields.email !== undefined) {
        console.warn('Profile upsert with email failed, retrying without email:', error);
        delete dbFields.email;
        const retryResult = await supabase
          .from('profiles')
          .upsert(dbFields)
          .eq('id', userId)
          .select()
          .single();
        data = retryResult.data;
        error = retryResult.error;
      }
      if (error) throw error;
    }

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
      avatar: data.avatar,
      rankCategory: data.rank_category,
      rank: data.rank,
      email: data.email
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

  // ── Exam Operations ─────────────────────────────────────

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
      questions: examData.questions || [],
      registration_open: examData.registrationOpen !== undefined ? examData.registrationOpen : true,
      registration_deadline: examData.registrationDeadline || null,
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

  // ── Exam Enrollment Operations (Super Admin Controlled) ───────────────────

  async enrollCandidateInExam(userId, examId, enrolledBy = null) {
    const id = generateUUID();
    const { error } = await supabase
      .from('exam_registrations')
      .upsert({ id, user_id: userId, exam_id: examId, enrolled_by: enrolledBy });
    if (error) throw error;
    return { id, userId, examId };
  },

  async removeEnrollment(userId, examId) {
    const { error } = await supabase
      .from('exam_registrations')
      .delete()
      .eq('user_id', userId)
      .eq('exam_id', examId);
    if (error) throw error;
  },

  async getEnrolledExamsForUser(userId) {
    const { data, error } = await supabase
      .from('exam_registrations')
      .select('exam_id, registered_at')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(r => ({ examId: r.exam_id, registeredAt: r.registered_at }));
  },

  async getEnrollmentsForExam(examId) {
    const { data: regs, error: regsErr } = await supabase
      .from('exam_registrations')
      .select('*')
      .eq('exam_id', examId);
    if (regsErr) throw regsErr;

    const userIds = [...new Set((regs || []).map(r => r.user_id).filter(Boolean))];
    let profiles = [];
    if (userIds.length > 0) {
      const { data: profs, error: profsErr } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      if (profsErr) throw profsErr;
      profiles = profs || [];
    }

    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return (regs || []).map(r => {
      const prof = profileMap.get(r.user_id) || {};
      return {
        enrollmentId: r.id,
        userId: r.user_id,
        examId: r.exam_id,
        registeredAt: r.registered_at,
        profile: {
          id: prof.id,
          name: prof.name,
          email: prof.email,
          phone: prof.phone || prof.phone_number,
          church: prof.church,
          association: prof.association,
          rankCategory: prof.rank_category,
          rank: prof.rank,
          dob: prof.dob,
          address: prof.address,
          chapterName: prof.chapter_name,
        }
      };
    });
  },

  async getAllEnrollments() {
    const { data: regs, error: regsErr } = await supabase
      .from('exam_registrations')
      .select('*')
      .order('registered_at', { ascending: false });
    if (regsErr) throw regsErr;

    const userIds = [...new Set((regs || []).map(r => r.user_id).filter(Boolean))];
    const examIds = [...new Set((regs || []).map(r => r.exam_id).filter(Boolean))];

    let profiles = [];
    if (userIds.length > 0) {
      const { data: profs, error: profsErr } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      if (profsErr) throw profsErr;
      profiles = profs || [];
    }

    let exams = [];
    if (examIds.length > 0) {
      const { data: exms, error: exmsErr } = await supabase
        .from('exams')
        .select('id, title, category')
        .in('id', examIds);
      if (exmsErr) throw exmsErr;
      exams = exms || [];
    }

    const profileMap = new Map(profiles.map(p => [p.id, p]));
    const examMap = new Map(exams.map(e => [e.id, e]));

    return (regs || []).map(r => {
      const prof = profileMap.get(r.user_id) || {};
      const ex = examMap.get(r.exam_id) || {};
      return {
        enrollmentId: r.id,
        userId: r.user_id,
        examId: r.exam_id,
        registeredAt: r.registered_at,
        examTitle: ex.title || 'N/A',
        examCategory: ex.category || 'N/A',
        profile: {
          id: prof.id,
          name: prof.name,
          email: prof.email,
          phone: prof.phone || prof.phone_number,
          church: prof.church,
          association: prof.association,
          rankCategory: prof.rank_category,
          rank: prof.rank,
          dob: prof.dob,
          address: prof.address,
          chapterName: prof.chapter_name,
        }
      };
    });
  },

  async closeExamRegistration(examId) {
    const { error } = await supabase
      .from('exams')
      .update({ registration_open: false })
      .eq('id', examId);
    if (error) throw error;
  },

  async openExamRegistration(examId) {
    const { error } = await supabase
      .from('exams')
      .update({ registration_open: true })
      .eq('id', examId);
    if (error) throw error;
  },

  // Check if registration is open for an exam (considers deadline + manual toggle)
  async isRegistrationOpen(examId) {
    const { data, error } = await supabase
      .from('exams')
      .select('registration_open, registration_deadline')
      .eq('id', examId)
      .maybeSingle();
    if (error || !data) return false;
    if (!data.registration_open) return false;
    if (data.registration_deadline) {
      const deadline = new Date(data.registration_deadline);
      if (new Date() > deadline) return false;
    }
    return true;
  },

  // Check if a candidate wrote Ambassador exam within the last 365 days
  async hasRecentAmbassadorSubmission(userId) {
    const { data, error } = await supabase
      .from('submissions')
      .select('submitted_at, exam_id, exams(category)')
      .eq('user_id', userId);
    if (error) return false;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return (data || []).some(s => {
      const isAmbassador = s.exams?.category === 'ambassador';
      const submittedRecently = new Date(s.submitted_at) > oneYearAgo;
      return isAmbassador && submittedRecently;
    });
  },

  // Get the date when a candidate becomes eligible for Ambassador Extraordinary
  // (1-year wait after submitting the Ambassador exam)
  async getAmbassadorExtraordinaryEligibilityDate(userId) {
    const { data, error } = await supabase
      .from('submissions')
      .select('submitted_at, exams(category)')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });
    if (error || !data) return null;
    const latest = (data || []).find(s => s.exams?.category === 'ambassador');
    if (!latest) return null;
    const eligibleDate = new Date(latest.submitted_at);
    eligibleDate.setFullYear(eligibleDate.getFullYear() + 1);
    return eligibleDate;
  },

  // Get the date when a candidate becomes eligible for Ambassador Plenipotentiary
  // (1-year wait after submitting the Ambassador Extraordinary exam)
  async getAmbassadorPlenipotentiaryEligibilityDate(userId) {
    const { data, error } = await supabase
      .from('submissions')
      .select('submitted_at, exams(category)')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });
    if (error || !data) return null;
    const latest = (data || []).find(s => s.exams?.category === 'ambassador_extraordinary');
    if (!latest) return null;
    const eligibleDate = new Date(latest.submitted_at);
    eligibleDate.setFullYear(eligibleDate.getFullYear() + 1);
    return eligibleDate;
  },

  // ── Past Candidates Import ────────────────────────────────────────────────

  async importPastCandidates(rows) {
    const records = rows.map(row => {
      const rawCat = row.rankCategory || row.RankCategory || row['Rank Category'] || '';
      const normCat = String(rawCat).trim().toLowerCase().replace(/\s+/g, '_');
      return {
        id: generateUUID(),
        name: row.name || row.Name || '',
        email: row.email || row.Email || '',
        church: row.church || row.Church || '',
        association: row.association || row.Association || '',
        rank_category: normCat,
        rank: row.rank || row.Rank || row['Rank Title'] || row.rankTitle || '',
        phone: row.phone || row.Phone || '',
        year: parseInt(row.year || row.Year || new Date().getFullYear()) || null,
      };
    }).filter(r => r.name.trim());

    if (records.length === 0) return { inserted: 0, errors: [] };

    const errors = [];
    let inserted = 0;
    // Batch insert in chunks of 50
    for (let i = 0; i < records.length; i += 50) {
      const chunk = records.slice(i, i + 50);
      const { error } = await supabase.from('past_candidates').insert(chunk);
      if (error) {
        errors.push(error.message);
      } else {
        inserted += chunk.length;
      }
    }
    return { inserted, errors };
  },

  async getPastCandidates(searchQuery = '') {
    let query = supabase.from('past_candidates').select('*').order('year', { ascending: false });
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,church.ilike.%${searchQuery}%,association.ilike.%${searchQuery}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      church: r.church,
      association: r.association,
      rankCategory: r.rank_category,
      rank: r.rank,
      phone: r.phone,
      year: r.year,
      importedAt: r.imported_at,
    }));
  },

  async deletePastCandidate(id) {
    const { error } = await supabase.from('past_candidates').delete().eq('id', id);
    if (error) throw error;
  },

  // ── Project Supervisors ───────────────────────────────────────────────────

  async assignProjectSupervisor(data) {
    const id = data.id || ('ps_' + Math.random().toString(36).substr(2, 9));
    const record = {
      id,
      candidate_user_id: data.candidateUserId,
      supervisor_name: data.supervisorName,
      supervisor_contact: data.supervisorContact || '',
      project_title: data.projectTitle || '',
      assigned_by: data.assignedBy || null,
    };
    const { error } = await supabase.from('project_supervisors').upsert(record);
    if (error) throw error;
    return { ...data, id };
  },

  async getProjectSupervisors() {
    const { data: svs, error } = await supabase
      .from('project_supervisors')
      .select('*')
      .order('assigned_at', { ascending: false });
    if (error) throw error;

    const userIds = [...new Set((svs || []).map(r => r.candidate_user_id).filter(Boolean))];
    let profiles = [];
    if (userIds.length > 0) {
      const { data: profs, error: profsErr } = await supabase
        .from('profiles')
        .select('id, name, email, church, association, rank_category')
        .in('id', userIds);
      if (profsErr) throw profsErr;
      profiles = profs || [];
    }

    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return (svs || []).map(r => {
      const prof = profileMap.get(r.candidate_user_id);
      return {
        id: r.id,
        candidateUserId: r.candidate_user_id,
        supervisorName: r.supervisor_name,
        supervisorContact: r.supervisor_contact,
        projectTitle: r.project_title,
        assignedAt: r.assigned_at,
        candidate: prof ? {
          name: prof.name,
          email: prof.email,
          church: prof.church,
          association: prof.association,
          rankCategory: prof.rank_category,
        } : null,
      };
    });
  },

  async deleteProjectSupervisor(id) {
    const { error } = await supabase.from('project_supervisors').delete().eq('id', id);
    if (error) throw error;
  },

  // ── Project File Uploads ──────────────────────────────────────────────────

  async uploadProjectFile(userId, file) {
    const ext = file.name.split('.').pop();
    const path = `projects/${userId}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('project-files')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(path);
    // Save reference in project_submissions table
    const subId = 'pf_' + Math.random().toString(36).substr(2, 9);
    await supabase.from('project_submissions').upsert({
      id: subId,
      user_id: userId,
      file_url: publicUrl,
      file_name: file.name,
      file_path: path,
      uploaded_at: new Date().toISOString(),
    });
    return { url: publicUrl, fileName: file.name, path };
  },

  async getProjectSubmissions(userId = null) {
    let query = supabase
      .from('project_submissions')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data: subs, error } = await query;
    if (error) throw error;

    const userIds = [...new Set((subs || []).map(r => r.user_id).filter(Boolean))];
    let profiles = [];
    if (userIds.length > 0) {
      const { data: profs, error: profsErr } = await supabase
        .from('profiles')
        .select('id, name, email, church, association, rank_category')
        .in('id', userIds);
      if (profsErr) throw profsErr;
      profiles = profs || [];
    }

    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return (subs || []).map(r => {
      const prof = profileMap.get(r.user_id);
      return {
        id: r.id,
        userId: r.user_id,
        fileUrl: r.file_url,
        fileName: r.file_name,
        uploadedAt: r.uploaded_at,
        candidate: prof ? {
          name: prof.name,
          email: prof.email,
          church: prof.church,
          association: prof.association,
          rankCategory: prof.rank_category,
        } : null,
      };
    });
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

  async submitExam(userId, userName, examId, examTitle, answers, warningsCount, durationSpent, infractionLogs = [], examQuestions = null) {
    // Fix B: use pre-loaded questions when available to avoid a redundant network round-trip
    let exam;
    if (examQuestions && examQuestions.length > 0) {
      exam = { questions: examQuestions };
    } else {
      exam = await this.getExamById(examId);
      if (!exam) throw new Error('Exam not found');
    }

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
    const defaultBlogs = [
      {
        id: 'blog_def_ltc2026',
        title: 'National Leadership Training Conference 2026 — Theme: "Divine Companionship"',
        author: 'Royal Ambassadors of Nigeria — Men\'s Missionary Union, NBC',
        date: '2026-07-18',
        image_url: '/ltc-2026-flyer.jpeg',
        content: `Royal Ambassadors of Nigeria invites all officers, counsellors, and candidates to the 2026 National Leadership Training Conference (LTC).

Theme: DIVINE COMPANIONSHIP
Scripture: Exodus 33:14

"My Presence will go with you, and I will give you rest." — God's promise is our confidence as we gather to be equipped, trained, and commissioned for greater service.

📅 DATE: 14th – 17th October, 2026
📍 VENUE: Peter Akintola Foundation Youth Centre
   KM 10, Abeokuta–Lagos Expressway, Obada, Abeokuta, Ogun State, Nigeria

💰 REGISTRATION FEES:
• Regular Registration — ₦18,000
• Plen. Exam Candidates — ₦20,000
• Plen. Decoration Candidates — ₦27,000

🎽 T-Shirt is included in the registration package.

🔗 Registration Link: https://tinyurl.com/NLTC26REG

Do not miss this life-changing gathering of Royal Ambassador leaders from across Nigeria. Come ready to learn, grow, and be transformed by Divine Companionship.

WE ARE AMBASSADORS FOR CHRIST — 2 Cor 5:20`
      },
      {
        id: 'blog_def1',
        title: '2026 Ushering-In & Handing Over Ceremony: THE KEYS OF THE KINGDOM',
        author: 'Conference Planning Committee',
        date: '2026-07-04',
        image_url: '/IMG-20260613-WA0001.jpg',
        content: `Royal Ambassadors, LWBC invites you to our 2026 Ushering-In & Handing Over Ceremony: THE KEYS OF THE KINGDOM

Witness the sacred handover of vision and authority as we raise leaders to unlock new territories for Christ.
This week-long program is a cornerstone spiritual event designed to inspire dedication, missionary zeal, and community service among all chapters. Under this year's theme, we focus on rebuilding the walls of service and rekindling the fire of active evangelism. All chapters are urged to finalize their parade schedules, community clean-up logistics, and special missionary collections. Let us walk in dignity and show the world what it means to be an Ambassador

📅 Sat, 4th July 2026 | 7:00 AM
📍 First Baptist Church, Ikeja

WE ARE AMBASSADORS FOR CHRIST — 2 Cor 5:20`
      },
      {
        id: 'blog_def3',
        title: 'Maximizing Your Exam Preparation: A Guide for Royal Ambassadors',
        author: 'Ranking Officer',
        date: '2026-06-05',
        content: "As the camping session draws near, candidates preparing for their promotional ranks are encouraged to start their study early. This year's exams will test theological knowledge, Baptist history, Royal Ambassador manual rules, and practical outdoor tasks. To help you succeed, the online portal offers sample questionnaires, study guides, and mock quiz exercises. Ensure you revise the pledge, declaration, and three ranks structure. Maintain focus, maintain integrity, and study to show yourself approved."
      }
    ];

    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;

      // Seed if the table is completely empty
      if (!data || data.length === 0) {
        console.log('Blogs database is empty. Attempting to seed default blogs...');
        const { error: seedError } = await supabase
          .from('blogs')
          .insert(defaultBlogs);
        if (seedError) {
          console.warn('Failed to seed default blogs in database:', seedError);
        } else {
          console.log('Successfully seeded default blogs in database.');
        }
        return defaultBlogs;
      }

      return data.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        date: b.date,
        content: b.content,
        image_url: b.image_url || null,
      }));
    } catch (err) {
      console.warn("Could not load blogs from database, using local defaults fallback:", err);
      return defaultBlogs;
    }
  },

  async saveBlog(blogData) {
    const dbBlog = {
      title: blogData.title,
      author: blogData.author,
      content: blogData.content,
      // image_url is optional — null means no featured image
      image_url: blogData.image_url || null,
    };

    let id = blogData.id;
    if (id) {
      const { error } = await supabase
        .from('blogs')
        .update(dbBlog)
        .eq('id', id);
      if (error) throw error;
    } else {
      id = generateUUID();
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
    return [
      {
        id: 'off_2',
        name: 'Coun. Philip Olopade',
        post: 'Director, RALWBC',
        image: '/26.jpg.jpeg',
        sortOrder: 1
      },
      {
        id: 'off_6',
        name: 'Coun. Damilola Aderibigbe',
        post: 'Assistant Director, RALWBC',
        image: '/officer-aderibigbe.jpeg',
        imagePosition: 'top',
        sortOrder: 2
      },
      {
        id: 'off_4',
        name: 'Amb. Akinola Asabisi',
        post: 'Secretary, RALWBC',
        image: '/_DSC2428.jpg',
        sortOrder: 3
      },
      {
        id: 'off_5',
        name: 'Amb. Daniel Ojeyomi',
        post: 'Recording Secretary, RALWBC',
        image: '/Daniel.jpeg',
        sortOrder: 4
      },
      {
        id: 'off_16',
        name: 'Amb. Matthew Adebayo Ajayi',
        post: 'Ranking Officer, RALWBC',
        image: '/officer-adebayo.jpeg',
        imagePosition: 'center top',
        sortOrder: 5
      },
      {
        id: 'off_7',
        name: 'Amb. Emmanuel Akinteye',
        post: 'Mission Officer, RALWBC',
        image: '/Mission.jpeg',
        sortOrder: 6
      },
      {
        id: 'off_8',
        name: 'Amb. Ayo Balogun',
        post: 'Custodian, RALWBC',
        image: '/_DSC2355.jpg',
        sortOrder: 7
      },
      {
        id: 'off_9',
        name: 'Amb. Pelumi Ojo',
        post: 'Treasurer, RALWBC',
        image: '/_DSC2437.jpg',
        sortOrder: 8
      },
      {
        id: 'off_10',
        name: 'Amb. Adeleke Adeyemi',
        post: 'Financial Secretary, RALWBC',
        image: '/fin.jpeg',
        sortOrder: 9
      },
      {
        id: 'off_14',
        name: 'Amb. Solomon Adepoju',
        post: 'Parade Commander, RALWBC',
        image: '/_DSC2363.jpg',
        sortOrder: 10
      },
      {
        id: 'off_12',
        name: 'Amb. Segun Adeniji',
        post: 'ASVC Coordinator, RALWBC',
        image: '/officer-adeniji.jpeg',
        sortOrder: 11
      },
      {
        id: 'off_11',
        name: 'Amb. Tobi Oni',
        post: 'Auditor, RALWBC',
        image: '/_DSC2348.jpg',
        sortOrder: 12
      },
      {
        id: 'off_13',
        name: 'Amb. Olamidotun Simidu',
        post: 'PRO, RALWBC',
        image: '/_DSC2447.jpg',
        sortOrder: 13
      },
      {
        id: 'off_1',
        name: 'Coun. Adegbola Thomas',
        post: 'Ex-Officio, RALWBC',
        image: '/25.jpg.jpeg',
        imagePosition: 'center 20%',
        imageScale: 1.5,
        sortOrder: 14
      }
    ];
  },

  async saveOfficer(officerData) {
    // Deprecated for static officers
    return officerData;
  },

  async deleteOfficer(id) {
    // Deprecated for static officers
    return true;
  },

  // ── Gallery Operations ────────────────────────────────────────────────────

  async getGalleryPhotos() {
    let dbPhotos = [];
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*');
      if (error) throw error;
      dbPhotos = (data || []).map(g => ({
        id: g.id,
        url: g.url,
        alt: g.alt || '',
        category: g.category
      }));
    } catch (err) {
      console.warn("Could not load gallery from database, using local assets only:", err);
    }

    const localPhotos = [];
    try {
      const images = import.meta.glob('/public/gallery/**/*.{jpg,jpeg,png,webp,svg}', { eager: true });
      Object.keys(images).forEach((key, index) => {
        const parts = key.split('/');
        if (parts.length >= 5) {
          const category = decodeURIComponent(parts[3]);
          const url = key.replace(/^\/public/, '');
          const filename = parts[parts.length - 1];
          const alt = filename.split('.')[0].replace(/[-_]/g, ' ');
          localPhotos.push({
            id: `local_${index}`,
            url,
            alt,
            category
          });
        }
      });
    } catch (err) {
      console.warn("Could not load local gallery assets:", err);
    }

    return [...localPhotos, ...dbPhotos];
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
      id = generateUUID();
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

  // ── Registration Window Operations ────────────────────────────────────────
  // Stored as two dedicated columns on camping_session row id=1.
  // Requires: ALTER TABLE camping_session
  //           ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT FALSE,
  //           ADD COLUMN IF NOT EXISTS registration_deadline DATE;

  async getRegistrationWindow() {
    const { data, error } = await supabase
      .from('camping_session')
      .select('registration_open, registration_deadline')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return { isOpen: false, deadline: null };
    return {
      isOpen: data.registration_open || false,
      deadline: data.registration_deadline || null
    };
  },

  async saveRegistrationWindow({ isOpen, deadline }) {
    const { error } = await supabase
      .from('camping_session')
      .upsert({
        id: 1,
        registration_open: isOpen,
        registration_deadline: deadline || null
      });
    if (error) throw error;
    return this.getRegistrationWindow();
  },

  async isRegistrationWindowOpen() {
    try {
      const win = await this.getRegistrationWindow();
      if (!win.isOpen) return false;
      if (win.deadline) {
        const deadline = new Date(win.deadline + 'T23:59:59');
        if (new Date() > deadline) return false;
      }
      return true;
    } catch (err) {
      // If DB unreachable, fail open so users are never incorrectly locked out
      console.warn('Could not check registration window:', err);
      return true;
    }
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
