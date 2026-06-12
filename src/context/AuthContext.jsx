import React, { createContext, useState, useEffect, useContext } from 'react';
import { dbService } from '../services/db';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    dbService.init();

    // Fetch initial session and set user
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch profile details
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              name: profile.name,
              email: session.user.email,
              role: profile.role,
              dob: profile.dob,
              phone: profile.phone || profile.phone_number,
              phoneNumber: profile.phone_number || profile.phone,
              church: profile.church,
              address: profile.address,
              chapterName: profile.chapter_name,
              association: profile.association,
              rankCategory: profile.rank_category,
              rank: profile.rank,
              avatar: profile.avatar
            });
          }
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen to changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          setCurrentUser({
            id: profile.id,
            name: profile.name,
            email: session.user.email,
            role: profile.role,
            dob: profile.dob,
            phone: profile.phone || profile.phone_number,
            phoneNumber: profile.phone_number || profile.phone,
            church: profile.church,
            address: profile.address,
            chapterName: profile.chapter_name,
            association: profile.association,
            rankCategory: profile.rank_category,
            rank: profile.rank,
            avatar: profile.avatar
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ── Auth actions (async because dbService.login/register are async) ─────────

  const login = async (email, password) => {
    const user = await dbService.login(email, password);
    setCurrentUser(user);
    return user;
  };

  const register = async (name, email, password, meta = {}) => {
    const user = await dbService.register(name, email, password, meta);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setCurrentUser(null);
  };

  const updateProfile = async (updatedUserFields) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || currentUser?.id;
      if (!userId) {
        console.error('No logged in user found to update profile');
        return;
      }

      // If caller passes a plain-text password, update it
      if (updatedUserFields.password) {
        await dbService.updateUserPassword(userId, updatedUserFields.password);
        // Remove plain-text password from fields
        delete updatedUserFields.password;
      }

      const updated = await dbService.updateUser(userId, updatedUserFields);
      if (updated) {
        setCurrentUser(prev => prev ? {
          ...prev,
          ...updated
        } : {
          id: userId,
          email: session?.user?.email || prev?.email,
          ...updated
        });
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
