import React, { createContext, useState, useEffect, useContext } from 'react';
import { dbService } from '../services/db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    dbService.init();
    const storedUser = localStorage.getItem('ralwbc_current_user');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  // ── Auth actions (async because dbService.login/register are async) ─────────

  const login = async (email, password) => {
    const user = await dbService.login(email, password);
    localStorage.setItem('ralwbc_current_user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const user = await dbService.register(name, email, password);
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('ralwbc_current_user', JSON.stringify(userWithoutPassword));
    setCurrentUser(userWithoutPassword);
    return userWithoutPassword;
  };

  const logout = () => {
    localStorage.removeItem('ralwbc_current_user');
    setCurrentUser(null);
  };

  const updateProfile = async (updatedUserFields) => {
    try {
      const storedUser = localStorage.getItem('ralwbc_current_user');
      if (!storedUser) return;

      const user    = JSON.parse(storedUser);

      // If caller passes a plain-text password, hash it before storing
      if (updatedUserFields.password) {
        updatedUserFields.password = await dbService.updateUserPassword(user.id, updatedUserFields.password)
          .then(() => undefined); // password is now updated in the users array; strip from session
        // Remove plain-text password from the session object
        delete updatedUserFields.password;
      }

      const newUser = { ...user, ...updatedUserFields };
      localStorage.setItem('ralwbc_current_user', JSON.stringify(newUser));
      setCurrentUser(newUser);

      // Also update in main users table (non-password fields only)
      const users = JSON.parse(localStorage.getItem('ralwbc_users') || '[]');
      const idx   = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updatedUserFields };
        localStorage.setItem('ralwbc_users', JSON.stringify(users));
      }
    } catch (e) {
      console.error('Failed to update profile', e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
