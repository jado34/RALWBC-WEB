import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public pages
import { Home }      from './pages/Home';
import { About }     from './pages/About';
import { Blogs }     from './pages/Blogs';
import { Gallery }   from './pages/Gallery';
import { Contact }   from './pages/Contact';
import { Resources } from './pages/Resources';
import { Officers }  from './pages/Officers';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/"          element={<Home />}      />
            <Route path="/about"     element={<About />}     />
            <Route path="/about-us"  element={<About />}     />
            <Route path="/officers"  element={<Officers />}  />
            <Route path="/blogs"     element={<Blogs />}     />
            <Route path="/gallery"   element={<Gallery />}   />
            <Route path="/contact"   element={<Contact />}   />
            <Route path="/resources" element={<Resources />} />

            {/* Fallback — redirect everything else to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
