import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ExamRoute } from './components/ExamRoute';

// Public pages
import { Home }       from './pages/Home';
import { About }      from './pages/About';
import { Blogs }      from './pages/Blogs';
import { Gallery }    from './pages/Gallery';
import { Contact }    from './pages/Contact';
import { Resources }  from './pages/Resources';
import { Login }      from './pages/Login';
import { Register }   from './pages/Register';
import { Officers }   from './pages/Officers';
import { AdminLogin } from './pages/AdminLogin';

// Protected Ambassador pages
import { Dashboard }        from './pages/Portal/Dashboard';
import { Examination }      from './pages/Portal/Examination';
import { Profile }          from './pages/Profile';
import { ProjectSubmission } from './pages/Portal/ProjectSubmission';

// Protected Admin pages
import { AdminDashboard }  from './pages/Portal/Admin/AdminDashboard';
import { ManageExams }     from './pages/Portal/Admin/ManageExams';
import { ManageBlogs }     from './pages/Portal/Admin/ManageBlogs';

import { PortalLayout } from './components/PortalLayout';
import { Outlet }       from 'react-router-dom';

// Layout wrapper for Portal pages
const PortalLayoutWrapper = () => (
  <PortalLayout>
    <Outlet />
  </PortalLayout>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="app-container">
            <Navbar />

            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/"           element={<Home />}      />
                <Route path="/about"      element={<About />}     />
                <Route path="/about-us"   element={<About />}     />
                <Route path="/officers"   element={<Officers />}  />
                <Route path="/blogs"      element={<Blogs />}     />
                <Route path="/gallery"    element={<Gallery />}   />
                <Route path="/contact"    element={<Contact />}   />
                <Route path="/resources"  element={<Resources />} />
                <Route path="/login"       element={<Login />}      />
                <Route path="/register"    element={<Register />}   />
                <Route path="/admin-access" element={<AdminLogin />} />

                {/* Portal Layout Wrapper for Dashboard and Profile screens */}
                <Route element={<PortalLayoutWrapper />}>
                  {/* Ambassador Portal Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/project"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <ProjectSubmission />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Admin Routes: Super Admin only ────────────────────────── */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'pro_admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  {/* Super Admin only routes */}
                  <Route
                    path="/admin/exams"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ManageExams />
                      </ProtectedRoute>
                    }
                  />
                  {/* PRO Admin + Super Admin: Blogs */}
                  <Route
                    path="/admin/blogs"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'pro_admin']}>
                        <ManageBlogs />
                      </ProtectedRoute>
                    }
                  />
                  {/* Profile for both admin types */}
                  <Route
                    path="/admin/profile"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'pro_admin']}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Ambassador Exam taking — full screen distraction-free (no portal sidebar layout) */}
                <Route
                  path="/exam/:id"
                  element={
                    <ExamRoute>
                      <Examination />
                    </ExamRoute>
                  }
                />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
