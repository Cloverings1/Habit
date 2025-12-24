import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { validateAvatarFile } from '../utils/avatarUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  getDisplayName: () => string;
  getAvatarUrl: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear any checkout flags on logout
    sessionStorage.removeItem('checkout_in_progress');
    await supabase.auth.signOut();
  };

  const updateDisplayName = async (name: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { display_name: name }
    });
    if (error) throw error;
  };

  const updateEmail = async (email: string) => {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('No user logged in');

    // Validate file (defense in depth)
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Derive extension from MIME type (not filename) to prevent injection
    const extMap: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp'
    };
    const ext = extMap[file.type] || 'jpg';
    const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    // Save URL to user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    if (updateError) throw updateError;

    return publicUrl;
  };

  const getDisplayName = (): string => {
    return user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  };

  const getAvatarUrl = (): string | null => {
    return user?.user_metadata?.avatar_url || null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signOut,
      updateDisplayName,
      updateEmail,
      updatePassword,
      uploadAvatar,
      getDisplayName,
      getAvatarUrl,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
