// LocalStorage Database Service for RALWBC Web App

// ── Password Hashing (SubtleCrypto SHA-256) ───────────────────────────────────
// Passwords are stored as 'sha256:<hex>' and never as plain text.
// Legacy plain-text passwords (from old data) are handled gracefully on login.
const HASH_PREFIX = 'sha256:';
const HASH_SALT = 'ralwbc_portal_2026';

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + HASH_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return HASH_PREFIX + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(input, stored) {
  if (stored.startsWith(HASH_PREFIX)) {
    const inputHash = await hashPassword(input);
    return inputHash === stored;
  }
  // Legacy plain-text fallback (migrates on next login)
  return input === stored;
}

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

// Empty defaults — no demo data
const DEFAULT_USERS = [];
const DEFAULT_EXAMS = [];
const DEFAULT_BLOGS = [];
const DEFAULT_SUBMISSIONS = [];
const DEFAULT_GALLERY = [
  { id: 'gal_1', url: '/Lagos-West1.jpeg', alt: 'Two men discussing at Lagos West Conference', category: 'Jubilee Experience' },
  { id: 'gal_2', url: '/626663584_18040805231733739_4709563975724227572_n.jpg', alt: 'RA member uniform profile inspection', category: 'Jubilee Experience' },
  { id: 'gal_3', url: '/671245412_18050382983733739_357892051856325748_n.jpg', alt: 'Stage event auditorium audience meeting', category: 'Jubilee Experience' },
  { id: 'gal_4', url: '/Lagos-West3.jpeg', alt: 'Ambassador saluting during drill inspection', category: 'Jubilee Experience' },
  { id: 'gal_5', url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&auto=format&fit=crop&q=60', alt: 'Singing with microphone during worship', category: 'Jubilee Experience' },
  { id: 'gal_6', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=60', alt: 'Marshal speaking at podium and address', category: 'Jubilee Experience' },

  { id: 'gal_7', url: '/Lagos-West1.jpeg', alt: 'Group discussion at Lagos West Conference', category: '2023 Ushering In' },
  { id: 'gal_8', url: '/626663584_18040805231733739_4709563975724227572_n.jpg', alt: 'RA parade prep', category: '2023 Ushering In' },
  { id: 'gal_9', url: '/671245412_18050382983733739_357892051856325748_n.jpg', alt: 'Conference congregation', category: '2023 Ushering In' },
  { id: 'gal_10', url: '/Lagos-West3.jpeg', alt: 'Ambassador salute inspection', category: '2023 Ushering In' },
  { id: 'gal_11', url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&auto=format&fit=crop&q=60', alt: 'Praise and worship service', category: '2023 Ushering In' },
  { id: 'gal_12', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=60', alt: 'Conference address', category: '2023 Ushering In' },

  { id: 'gal_13', url: '/Lagos-West1.jpeg', alt: 'Chapter Inauguration Discussion', category: 'Chapter Inauguration' },
  { id: 'gal_14', url: '/626663584_18040805231733739_4709563975724227572_n.jpg', alt: 'Inauguration parade', category: 'Chapter Inauguration' },
  { id: 'gal_15', url: '/671245412_18050382983733739_357892051856325748_n.jpg', alt: 'Inauguration congregation', category: 'Chapter Inauguration' },
  { id: 'gal_16', url: '/Lagos-West3.jpeg', alt: 'Ambassador salute parade', category: 'Chapter Inauguration' },
  { id: 'gal_17', url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&auto=format&fit=crop&q=60', alt: 'Inauguration praise', category: 'Chapter Inauguration' },
  { id: 'gal_18', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=60', alt: 'Inauguration address', category: 'Chapter Inauguration' },
];

const DEFAULT_OFFICERS = [
  { id: 'off_1', name: 'Coun. Adegbola Thomas', post: 'Director, RALWBC', image: '', sortOrder: 1 },
  { id: 'off_2', name: 'Amb. Philip Olopade', post: 'Assistant Director, RALWBC', image: '', sortOrder: 2 },
  { id: 'off_3', name: 'Amb. Akinola Asabisi', post: 'Secretary, RALWBC', image: '', sortOrder: 3 },
  { id: 'off_4', name: 'Amb. Daniel Ojeyomi', post: 'Recording Secretary, RALWBC', image: '', sortOrder: 4 },
  { id: 'off_5', name: 'Amb. Damilola Aderibigbe', post: 'Ranking officer, RALWBC', image: '', sortOrder: 5 },
  { id: 'off_6', name: 'Amb. Emmanuel Akinteye', post: 'Mission Officer, RALWBC', image: '', sortOrder: 6 },
  { id: 'off_7', name: 'Amb. Ayo Balogun', post: 'Custodian, RALWBC', image: '', sortOrder: 7 },
  { id: 'off_8', name: 'Amb. Pelumi Ojo', post: 'Treasurer, RALWBC', image: '', sortOrder: 8 },
  { id: 'off_9', name: 'Amb. Adeleke Adeyemi', post: 'Financial Secretary, RALWBC', image: '', sortOrder: 9 },
  { id: 'off_10', name: 'Amb. Tobi Oni', post: 'Auditor, RALWBC', image: '', sortOrder: 10 },
  { id: 'off_11', name: 'Amb. Segun Adeniji', post: 'ASVC Coordinator, RALWBC', image: '', sortOrder: 11 },
  { id: 'off_12', name: 'Amb. Olamidotun Simidu', post: 'PRO, RALWBC', image: '', sortOrder: 12 },
];

// Default camping/exam session window (closed by default)
const DEFAULT_SESSION = { startDate: null, endDate: null, startTime: '08:00', isOpen: false };

// ── LocalStorage helpers ──────────────────────────────────────────────────────
const getStorageItem = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
};

const setStorageItem = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      throw new Error('Storage full: The browser storage limit has been reached. Please contact the administrator to clear old gallery images before uploading more.');
    }
    throw e;
  }
};

// ── DB Service ────────────────────────────────────────────────────────────────
export const dbService = {

  // Initialize Database
  init() {
    getStorageItem('ralwbc_users', DEFAULT_USERS);
    getStorageItem('ralwbc_exams', DEFAULT_EXAMS);
    getStorageItem('ralwbc_blogs', DEFAULT_BLOGS);
    getStorageItem('ralwbc_submissions', DEFAULT_SUBMISSIONS);

    const officers = localStorage.getItem('ralwbc_officers');
    if (!officers || JSON.parse(officers).length === 0) {
      localStorage.setItem('ralwbc_officers', JSON.stringify(DEFAULT_OFFICERS));
    }

    const gallery = localStorage.getItem('ralwbc_gallery');
    if (!gallery || JSON.parse(gallery).length === 0) {
      localStorage.setItem('ralwbc_gallery', JSON.stringify(DEFAULT_GALLERY));
    }

    getStorageItem('ralwbc_session', DEFAULT_SESSION);
  },

  // ── Auth Operations ───────────────────────────────────────────────────────

  /**
   * Register a new student account.
   * Admins can ONLY be created via populateDemoData() or direct DB seeding —
   * the self-registration admin code has been removed from the client bundle.
   */
  async register(name, email, password) {
    const users = getStorageItem('ralwbc_users', DEFAULT_USERS);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const hashedPassword = await hashPassword(password);
    const newUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: hashedPassword,
      role: 'student',
    };
    users.push(newUser);
    setStorageItem('ralwbc_users', users);
    return newUser;
  },

  async login(email, password) {
    const users = getStorageItem('ralwbc_users', DEFAULT_USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Invalid email or password');

    const match = await verifyPassword(password, user.password);
    if (!match) throw new Error('Invalid email or password');

    // Silently upgrade legacy plain-text passwords to hashed on successful login
    if (!user.password.startsWith(HASH_PREFIX)) {
      user.password = await hashPassword(password);
      setStorageItem('ralwbc_users', users);
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  updateUser(userId, fields) {
    const users = getStorageItem('ralwbc_users', DEFAULT_USERS);
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...fields };
      setStorageItem('ralwbc_users', users);
      return users[idx];
    }
    return null;
  },

  /**
   * Update user password — accepts a plain-text newPassword and hashes it.
   * Returns a Promise.
   */
  async updateUserPassword(userId, newPassword) {
    const hashed = await hashPassword(newPassword);
    return this.updateUser(userId, { password: hashed });
  },

  /**
   * Admin: permanently delete a registered student account.
   * Also removes all their exam submissions.
   */
  deleteUser(userId) {
    const users = getStorageItem('ralwbc_users', DEFAULT_USERS);
    setStorageItem('ralwbc_users', users.filter(u => u.id !== userId));
    const subs = getStorageItem('ralwbc_submissions', DEFAULT_SUBMISSIONS);
    setStorageItem('ralwbc_submissions', subs.filter(s => s.userId !== userId));
  },

  // ── Exam Operations ───────────────────────────────────────────────────────

  getExams() { return getStorageItem('ralwbc_exams', DEFAULT_EXAMS); },
  getExamsByCategory(category) {
    const exams = this.getExams();
    if (!category) return exams;
    return exams.filter(e => e.category === category);
  },
  getExamById(id) {
    return this.getExams().find(e => e.id === id) || null;
  },
  saveExam(examData) {
    const exams = this.getExams();
    if (examData.id) {
      const index = exams.findIndex(e => e.id === examData.id);
      if (index !== -1) exams[index] = examData;
    } else {
      examData.id = 'exm_' + Math.random().toString(36).substr(2, 9);
      exams.push(examData);
    }
    setStorageItem('ralwbc_exams', exams);
    return examData;
  },
  deleteExam(id) {
    setStorageItem('ralwbc_exams', this.getExams().filter(e => e.id !== id));
  },

  // ── Submission Operations ─────────────────────────────────────────────────

  getSubmissions() { return getStorageItem('ralwbc_submissions', DEFAULT_SUBMISSIONS); },
  getSubmissionsByUser(userId) { return this.getSubmissions().filter(s => s.userId === userId); },
  getSubmissionForUserAndExam(userId, examId) {
    return this.getSubmissions().find(s => s.userId === userId && s.examId === examId) || null;
  },
  deleteSubmission(submissionId) {
    setStorageItem('ralwbc_submissions', this.getSubmissions().filter(s => s.id !== submissionId));
  },
  resetExamSubmissions(examId) {
    setStorageItem('ralwbc_submissions', this.getSubmissions().filter(s => s.examId !== examId));
  },

  submitExam(userId, userName, examId, examTitle, answers, warningsCount, durationSpent, infractionLogs = []) {
    const exam = this.getExamById(examId);
    if (!exam) throw new Error('Exam not found');

    const existing = this.getSubmissionForUserAndExam(userId, examId);
    if (existing) throw new Error('You have already submitted this exam.');

    let correctCount = 0;
    const totalQuestions = exam.questions.length;
    exam.questions.forEach(q => {
      if (answers[q.id] && answers[q.id] === q.correctAnswer) correctCount++;
    });
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const submission = {
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      userId, userName, examId, examTitle,
      answers, correctCount, totalQuestions, scorePercentage,
      warningsCount, infractionLogs, durationSpent,
      submittedAt: new Date().toISOString(),
    };

    const subs = this.getSubmissions();
    subs.push(submission);
    setStorageItem('ralwbc_submissions', subs);
    return submission;
  },

  // ── Blog Operations ───────────────────────────────────────────────────────

  getBlogs() { return getStorageItem('ralwbc_blogs', DEFAULT_BLOGS); },
  saveBlog(blogData) {
    const blogs = this.getBlogs();
    if (blogData.id) {
      const index = blogs.findIndex(b => b.id === blogData.id);
      if (index !== -1) blogs[index] = { ...blogs[index], ...blogData };
    } else {
      blogData.id = 'blog_' + Math.random().toString(36).substr(2, 9);
      blogData.date = new Date().toISOString().split('T')[0];
      blogs.push(blogData);
    }
    setStorageItem('ralwbc_blogs', blogs);
    return blogData;
  },
  deleteBlog(id) {
    setStorageItem('ralwbc_blogs', this.getBlogs().filter(b => b.id !== id));
  },

  // ── Officer Operations ────────────────────────────────────────────────────

  getOfficers() {
    const officers = getStorageItem('ralwbc_officers', DEFAULT_OFFICERS);
    return officers.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  },
  saveOfficer(officerData) {
    const officers = getStorageItem('ralwbc_officers', DEFAULT_OFFICERS);
    if (officerData.id) {
      const index = officers.findIndex(o => o.id === officerData.id);
      if (index !== -1) officers[index] = { ...officers[index], ...officerData };
    } else {
      officerData.id = 'off_' + Math.random().toString(36).substr(2, 9);
      officers.push(officerData);
    }
    setStorageItem('ralwbc_officers', officers);
    return officerData;
  },
  deleteOfficer(id) {
    setStorageItem('ralwbc_officers', this.getOfficers().filter(o => o.id !== id));
  },

  // ── Gallery Operations ────────────────────────────────────────────────────

  getGalleryPhotos() { return getStorageItem('ralwbc_gallery', DEFAULT_GALLERY); },
  saveGalleryPhoto(photoData) {
    const photos = this.getGalleryPhotos();
    if (photoData.id) {
      const index = photos.findIndex(p => p.id === photoData.id);
      if (index !== -1) photos[index] = { ...photos[index], ...photoData };
    } else {
      photoData.id = 'gal_' + Math.random().toString(36).substr(2, 9);
      photos.push(photoData);
    }
    // May throw QuotaExceededError — caller must handle
    setStorageItem('ralwbc_gallery', photos);
    return photoData;
  },
  deleteGalleryPhoto(id) {
    setStorageItem('ralwbc_gallery', this.getGalleryPhotos().filter(p => p.id !== id));
  },

  // ── Demo Data Populator ───────────────────────────────────────────────────

  /**
   * Async because passwords must be hashed before storing.
   * Call with: await dbService.populateDemoData()
   */
  async populateDemoData() {
    localStorage.removeItem('ralwbc_users');
    localStorage.removeItem('ralwbc_exams');
    localStorage.removeItem('ralwbc_blogs');
    localStorage.removeItem('ralwbc_submissions');
    localStorage.removeItem('ralwbc_gallery');
    localStorage.removeItem('ralwbc_session');

    const adminPwd = await hashPassword('adminpassword');
    const studentPwd = await hashPassword('password');

    const adminUser = { id: 'usr_admin', name: 'Admin Committee', email: 'admin@ralwbc.org', password: adminPwd, role: 'admin' };
    const student1 = { id: 'usr_samuel', name: 'Samuel Adebayo', email: 'samuel@gmail.com', password: studentPwd, role: 'student', dob: '2008-04-12', phone: '+2348011112222', phoneNumber: '+2348011112222', church: 'First Baptist Church, Ikeja', address: '12, Allen Avenue, Ikeja', chapterName: 'Ikeja Pioneers', association: 'Lagos West Association', rankCategory: 'ambassador', rank: 'Ambassador' };
    const student2 = { id: 'usr_david', name: 'David Okon', email: 'david@gmail.com', password: studentPwd, role: 'student', dob: '2007-08-24', phone: '+2348033334444', phoneNumber: '+2348033334444', church: 'Grace Baptist Church, Surulere', address: '45, Adeniran Ogunsanya, Surulere', chapterName: 'Surulere Victors', association: 'Lagos West Association', rankCategory: 'ambassador_extraordinary', rank: 'Ambassador Extraordinary' };
    const student3 = { id: 'usr_emmanuel', name: 'Emmanuel Cole', email: 'emmanuel@gmail.com', password: studentPwd, role: 'student', dob: '2005-11-03', phone: '+2348055556666', phoneNumber: '+2348055556666', church: 'Faith Baptist Church, Agege', address: '88, Agege Motor Road, Agege', chapterName: 'Agege Conquerors', association: 'Lagos West Association', rankCategory: 'ambassador_plenipotentiary', rank: 'Ambassador Plenipotentiary' };

    setStorageItem('ralwbc_users', [adminUser, student1, student2, student3]);

    const exam1 = {
      id: 'exm_amb', title: 'Ambassador General Ranking Exam',
      description: 'Basic ranking exam covering RA history, core pledges, and Matthew 28 scripture verification.',
      category: 'ambassador', duration: 20, isActive: true,
      questions: [
        { id: 'q_amb1', text: 'What is the official motto of the Royal Ambassadors of Nigeria?', options: ['We are ambassadors for Christ', 'Touching the lives of boys', 'Implanting scripture in boys', 'To the work, to the work'], optionImages: ['', '', '', ''], correctAnswer: 'We are ambassadors for Christ' },
        { id: 'q_amb2', text: 'In what year was the Royal Ambassador organization founded?', options: ['1908', '1998', '1954', '1944'], optionImages: ['', '', '', ''], correctAnswer: '1908' },
        { id: 'q_amb3', text: 'Which scripture text serves as the basis for the RA Motto?', options: ['Matthew 28:19-20', '2 Corinthians 5:20', 'John 3:16', 'Ephesians 6:1-3'], optionImages: ['', '', '', ''], correctAnswer: '2 Corinthians 5:20' },
      ],
    };
    const exam2 = {
      id: 'exm_extra', title: 'Ambassador Extraordinary Theological Exam',
      description: 'Intermediate exam assessing the theological aspects of the Royal Ambassador rank.',
      category: 'ambassador_extraordinary', duration: 30, isActive: true,
      questions: [
        { id: 'q_extra1', text: 'Who is the current Director of the RALWBC?', options: ['Coun. Adegbola Thomas', 'Amb. Philip Olopade', 'Amb. Akinola Asabisi', 'Amb. Daniel Ojeyomi'], optionImages: ['', '', '', ''], correctAnswer: 'Coun. Adegbola Thomas' },
        { id: 'q_extra2', text: 'The emblem of the Royal Ambassadors contains which geometric shapes?', options: ['Shield, Star, Crown', 'Shield, Cross, Circle', 'Anchor, Star, Shield', 'Cross, Crown, Shield'], optionImages: ['', '', '', ''], correctAnswer: 'Shield, Star, Crown' },
      ],
    };
    setStorageItem('ralwbc_exams', [exam1, exam2]);

    const blog1 = { id: 'blog_demo1', title: 'Announcement: 2026 Annual Camping Session Schedule', author: 'Exam Committee', date: new Date().toISOString().split('T')[0], content: 'Greetings Ambassadors! The 2026 Annual Camping and Promotion Session will be held from September 10th to September 15th. All candidates must complete their profiles and verify their rank categories prior to August 30th to be enrolled in the ranking exams.' };
    const blog2 = { id: 'blog_demo2', title: 'RA Promotion Exam Study Guide Out', author: 'Ranking Board', date: new Date().toISOString().split('T')[0], content: 'The ranking board has released the study materials for the upcoming promotion exams. Focus on RA history, pledges, hymns, and Matthew 28:19-20. Study hard, write well, and remember: we are ambassadors for Christ!' };
    setStorageItem('ralwbc_blogs', [blog1, blog2]);

    setStorageItem('ralwbc_gallery', DEFAULT_GALLERY);

    const sub1 = { id: 'sub_demo1', userId: 'usr_samuel', userName: 'Samuel Adebayo', examId: 'exm_amb', examTitle: 'Ambassador General Ranking Exam', answers: { q_amb1: 'We are ambassadors for Christ', q_amb2: '1908', q_amb3: 'Matthew 28:19-20' }, correctCount: 2, totalQuestions: 3, scorePercentage: 67, warningsCount: 1, infractionLogs: [{ timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), reason: 'Exam browser window lost focus.' }], durationSpent: 620, submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() };
    const sub2 = { id: 'sub_demo2', userId: 'usr_david', userName: 'David Okon', examId: 'exm_extra', examTitle: 'Ambassador Extraordinary Theological Exam', answers: { q_extra1: 'Coun. Adegbola Thomas', q_extra2: 'Shield, Star, Crown' }, correctCount: 2, totalQuestions: 2, scorePercentage: 100, warningsCount: 3, infractionLogs: [{ timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), reason: 'Browser tab or application switched.' }, { timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), reason: 'Keyboard shortcuts blocked.' }, { timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), reason: 'Secure fullscreen mode exited.' }], durationSpent: 1140, submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() };
    setStorageItem('ralwbc_submissions', [sub1, sub2]);

    setStorageItem('ralwbc_session', {
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0],
      startTime: '08:00',
      isOpen: true,
    });
  },

  // ── Session / Camping Window Operations ──────────────────────────────────

  getSession() { return getStorageItem('ralwbc_session', DEFAULT_SESSION); },
  saveSession(sessionData) {
    const current = this.getSession();
    const updated = { ...current, ...sessionData };
    setStorageItem('ralwbc_session', updated);
    return updated;
  },

  /**
   * Returns true if the portal is currently within the active exam session window.
   * Open when: admin forced isOpen=true  OR  today is between startDate and endDate (inclusive).
   * Respects startTime if provided.
   */
  isSessionActive() {
    const session = this.getSession();
    if (session.isOpen) return true;
    if (!session.startDate || !session.endDate) return false;
    const now = new Date();
    const time = session.startTime || '08:00';
    const start = new Date(session.startDate + 'T' + time + ':00');
    const end = new Date(session.endDate + 'T23:59:59');
    return now >= start && now <= end;
  },
};
