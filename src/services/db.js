// LocalStorage Database Service for RALWBC Web App

const ADMIN_REGISTRATION_CODE = "RALWBC-COMMITTEE-2026";

// Rank categories — the three official RA exam tiers
export const RANK_CATEGORIES = [
  { value: 'ambassador', label: 'Ambassador' },
  { value: 'ambassador_extraordinary', label: 'Ambassador Extraordinary' },
  { value: 'ambassador_plenipotentiary', label: 'Ambassador Plenipotentiary' }
];

export const getRankLabel = (value) => {
  const found = RANK_CATEGORIES.find(r => r.value === value);
  return found ? found.label : value || 'N/A';
};

// Empty defaults — no demo data
const DEFAULT_USERS = [];
const DEFAULT_EXAMS = [];
const DEFAULT_BLOGS = [];
const DEFAULT_SUBMISSIONS = [];
const DEFAULT_OFFICERS = [];

// Default camping/exam session window (closed by default)
const DEFAULT_SESSION = {
  startDate: null,
  endDate: null,
  isOpen: false
};

// Helper functions to interact with LocalStorage
const getStorageItem = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

const setStorageItem = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const dbService = {
  // Initialize Database
  init() {
    getStorageItem("ralwbc_users", DEFAULT_USERS);
    getStorageItem("ralwbc_exams", DEFAULT_EXAMS);
    getStorageItem("ralwbc_blogs", DEFAULT_BLOGS);
    getStorageItem("ralwbc_submissions", DEFAULT_SUBMISSIONS);
    getStorageItem("ralwbc_officers", DEFAULT_OFFICERS);
    getStorageItem("ralwbc_session", DEFAULT_SESSION);
  },

  // ── Auth Operations ──────────────────────────────────────────────────────────

  register(name, email, password, adminCode = "") {
    const users = getStorageItem("ralwbc_users", DEFAULT_USERS);

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already registered");
    }

    let role = "student";
    if (adminCode) {
      if (adminCode.trim() === ADMIN_REGISTRATION_CODE) {
        role = "admin";
      } else {
        throw new Error("Invalid admin registration code");
      }
    }

    const newUser = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      role
    };

    users.push(newUser);
    setStorageItem("ralwbc_users", users);
    return newUser;
  },

  login(email, password) {
    const users = getStorageItem("ralwbc_users", DEFAULT_USERS);
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error("Invalid email or password");
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  updateUser(userId, fields) {
    const users = getStorageItem("ralwbc_users", DEFAULT_USERS);
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...fields };
      setStorageItem("ralwbc_users", users);
      return users[idx];
    }
    return null;
  },

  /**
   * Admin: permanently delete a registered student account.
   * Also removes all their exam submissions.
   */
  deleteUser(userId) {
    const users = getStorageItem("ralwbc_users", DEFAULT_USERS);
    const filtered = users.filter(u => u.id !== userId);
    setStorageItem("ralwbc_users", filtered);

    // Also remove their submissions
    const subs = getStorageItem("ralwbc_submissions", DEFAULT_SUBMISSIONS);
    const cleanedSubs = subs.filter(s => s.userId !== userId);
    setStorageItem("ralwbc_submissions", cleanedSubs);
  },

  // ── Exam Operations ──────────────────────────────────────────────────────────

  getExams() {
    return getStorageItem("ralwbc_exams", DEFAULT_EXAMS);
  },

  /**
   * Return only exams matching a specific rank category.
   * If category is null/undefined, returns all exams.
   */
  getExamsByCategory(category) {
    const exams = this.getExams();
    if (!category) return exams;
    return exams.filter(e => e.category === category);
  },

  getExamById(id) {
    const exams = this.getExams();
    return exams.find(e => e.id === id) || null;
  },

  saveExam(examData) {
    const exams = this.getExams();
    if (examData.id) {
      const index = exams.findIndex(e => e.id === examData.id);
      if (index !== -1) {
        exams[index] = examData;
      }
    } else {
      examData.id = "exm_" + Math.random().toString(36).substr(2, 9);
      exams.push(examData);
    }
    setStorageItem("ralwbc_exams", exams);
    return examData;
  },

  deleteExam(id) {
    const exams = this.getExams();
    setStorageItem("ralwbc_exams", exams.filter(e => e.id !== id));
  },

  // ── Submission Operations ────────────────────────────────────────────────────

  getSubmissions() {
    return getStorageItem("ralwbc_submissions", DEFAULT_SUBMISSIONS);
  },

  getSubmissionsByUser(userId) {
    return this.getSubmissions().filter(s => s.userId === userId);
  },

  getSubmissionForUserAndExam(userId, examId) {
    return this.getSubmissions().find(
      s => s.userId === userId && s.examId === examId
    ) || null;
  },

  /**
   * Admin: delete a single submission by its ID.
   * This allows a student to re-attempt the exam.
   */
  deleteSubmission(submissionId) {
    const subs = this.getSubmissions();
    setStorageItem("ralwbc_submissions", subs.filter(s => s.id !== submissionId));
  },

  /**
   * Admin: wipe ALL submissions for a specific exam (year-end reset).
   */
  resetExamSubmissions(examId) {
    const subs = this.getSubmissions();
    setStorageItem("ralwbc_submissions", subs.filter(s => s.examId !== examId));
  },

  submitExam(userId, userName, examId, examTitle, answers, warningsCount, durationSpent, infractionLogs = []) {
    const exams = this.getExams();
    const exam = exams.find(e => e.id === examId);
    if (!exam) throw new Error("Exam not found");

    const existing = this.getSubmissionForUserAndExam(userId, examId);
    if (existing) throw new Error("You have already submitted this exam.");

    let correctCount = 0;
    const totalQuestions = exam.questions.length;

    exam.questions.forEach(q => {
      if (answers[q.id] && answers[q.id] === q.correctAnswer) correctCount++;
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const submission = {
      id: "sub_" + Math.random().toString(36).substr(2, 9),
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
      submittedAt: new Date().toISOString()
    };

    const subs = this.getSubmissions();
    subs.push(submission);
    setStorageItem("ralwbc_submissions", subs);
    return submission;
  },

  // ── Blog Operations ──────────────────────────────────────────────────────────

  getBlogs() {
    return getStorageItem("ralwbc_blogs", DEFAULT_BLOGS);
  },

  saveBlog(blogData) {
    const blogs = this.getBlogs();
    if (blogData.id) {
      const index = blogs.findIndex(b => b.id === blogData.id);
      if (index !== -1) blogs[index] = { ...blogs[index], ...blogData };
    } else {
      blogData.id = "blog_" + Math.random().toString(36).substr(2, 9);
      blogData.date = new Date().toISOString().split('T')[0];
      blogs.push(blogData);
    }
    setStorageItem("ralwbc_blogs", blogs);
    return blogData;
  },

  deleteBlog(id) {
    setStorageItem("ralwbc_blogs", this.getBlogs().filter(b => b.id !== id));
  },

  // ── Officer Operations ───────────────────────────────────────────────────────

  getOfficers() {
    const officers = getStorageItem("ralwbc_officers", DEFAULT_OFFICERS);
    return officers.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  },

  saveOfficer(officerData) {
    const officers = getStorageItem("ralwbc_officers", DEFAULT_OFFICERS);
    if (officerData.id) {
      const index = officers.findIndex(o => o.id === officerData.id);
      if (index !== -1) officers[index] = { ...officers[index], ...officerData };
    } else {
      officerData.id = "off_" + Math.random().toString(36).substr(2, 9);
      officers.push(officerData);
    }
    setStorageItem("ralwbc_officers", officers);
    return officerData;
  },

  deleteOfficer(id) {
    setStorageItem("ralwbc_officers", this.getOfficers().filter(o => o.id !== id));
  },

  // ── Session / Camping Window Operations ──────────────────────────────────────

  getSession() {
    return getStorageItem("ralwbc_session", DEFAULT_SESSION);
  },

  saveSession(sessionData) {
    const current = this.getSession();
    const updated = { ...current, ...sessionData };
    setStorageItem("ralwbc_session", updated);
    return updated;
  },

  /**
   * Returns true if the portal is currently within the active exam session window.
   * Open when: admin forced isOpen=true OR today is between startDate and endDate (inclusive).
   */
  isSessionActive() {
    const session = this.getSession();
    if (session.isOpen) return true;
    if (!session.startDate || !session.endDate) return false;
    const now = new Date();
    const start = new Date(session.startDate + "T00:00:00");
    const end = new Date(session.endDate + "T23:59:59");
    return now >= start && now <= end;
  }
};
