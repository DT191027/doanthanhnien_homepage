import { supabase } from './supabaseClient';

export const authService = {
  // Direct Supabase Authentication
  async login(emailOrUsername, password) {
    let email = emailOrUsername.trim();
    if (!email.includes('@')) {
      email = `${email}@gmail.com`; // Normalize username 'doanxaxuanthoison' to 'doanxaxuanthoison@gmail.com'
    }

    try {
      // 1. Authenticate with Supabase Auth API
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (!error && data?.session) {
        return { success: true, user: data.user, type: 'supabase' };
      }
      
      // If error from Supabase Auth, check if fallback default account matches
      if (
        (emailOrUsername.trim() === 'doanxaxuanthoison' || email === 'doanxaxuanthoison.tphcm@gmail.com') && 
        (password === 'doanxaxuanthoison2026' || password === 'admin123')
      ) {
        return { success: true, user: { email: email }, type: 'admin_default' };
      }

      return { success: false, error: error?.message || 'Tài khoản hoặc mật khẩu không đúng' };
    } catch (e) {
      console.warn('Supabase auth notice:', e);
      return { success: false, error: e.message };
    }
  },

  async getCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user || null;
    } catch (e) {
      return null;
    }
  },

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }
};
