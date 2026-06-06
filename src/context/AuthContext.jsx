import React, { createContext, useState, useEffect, useContext } from 'react';
import { dbService } from '../services/db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize database default structures
    dbService.init();

    // Check if user session already exists in LocalStorage
    const storedUser = localStorage.getItem("ralwbc_current_user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    try {
      const user = dbService.login(email, password);
      localStorage.setItem("ralwbc_current_user", JSON.stringify(user));
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = (name, email, password, adminCode = "") => {
    try {
      const user = dbService.register(name, email, password, adminCode);
      // Automatically log in on registration
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem("ralwbc_current_user", JSON.stringify(userWithoutPassword));
      setCurrentUser(userWithoutPassword);
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("ralwbc_current_user");
    setCurrentUser(null);
  };

  const updateProfile = (updatedUserFields) => {
    try {
      const storedUser = localStorage.getItem("ralwbc_current_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const newUser = { ...user, ...updatedUserFields };
        localStorage.setItem("ralwbc_current_user", JSON.stringify(newUser));
        setCurrentUser(newUser);

        // Also update in main users table
        const users = JSON.parse(localStorage.getItem("ralwbc_users") || "[]");
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...updatedUserFields };
          localStorage.setItem("ralwbc_users", JSON.stringify(users));
        }
      }
    } catch (e) {
      console.error("Failed to update profile", e);
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
