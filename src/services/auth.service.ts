import { supabase } from './supabase';
import { User } from '../types';

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile with role
      if (data.user) {
        const profile = await this.getProfile(data.user.id);
        return { user: data.user, profile, session: data.session, error: null };
      }

      return { user: null, profile: null, session: null, error: 'No user data' };
    } catch (error: any) {
      return { user: null, profile: null, session: null, error: error.message };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data as User;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data.session, error: null };
    } catch (error: any) {
      return { session: null, error: error.message };
    }
  },

  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return { session: data.session, error: null };
    } catch (error: any) {
      return { session: null, error: error.message };
    }
  },

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'carrentalapp://reset-password',
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  onAuthStateChange(callback: (user: any, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user, session);
    });
  },
};
