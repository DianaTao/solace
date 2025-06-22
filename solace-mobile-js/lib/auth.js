import { supabase, TABLES } from './supabase';

export class AuthService {
  // Sign in with email and password
  static async signIn(credentials) {
    try {
      console.log('🔐 Attempting Supabase login with:', credentials.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('❌ Supabase login error:', error.message);
        throw error;
      }

      console.log('✅ Supabase login successful');

      // Get user profile data - if it fails, create a basic profile
      if (data.user) {
        let profile = await this.getUserProfile(data.user.id);
        
        // If no profile exists, create a basic one for the session
        if (!profile) {
          console.log('📝 Creating basic user profile for session...');
          profile = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || 'User',
            role: 'social_worker',
            created_at: new Date().toISOString()
          };
        }
        
        return { user: profile, session: data.session };
      }

      return { user: null, session: null };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign up with email and password
  static async signUp(email, password, userData) {
    try {
      console.log('📝 Attempting Supabase signup with:', email);
      
      // First, check if user already exists in our users table
      const existingUser = await this.checkUserExists(email);
      if (existingUser) {
        console.log('👤 User already exists in database:', email);
        throw new Error('User already registered');
      }

      // Also check if user exists in Supabase auth (in case they're in auth but not in our users table)
      const existingAuthUser = await this.checkAuthUserExists(email);
      if (existingAuthUser) {
        console.log('👤 User already exists in auth system:', email);
        throw new Error('User already registered');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        console.error('❌ Supabase signup error:', error.message);
        throw error;
      }

      console.log('✅ Supabase signup successful');

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email,
          ...userData,
        });
      }

      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign out
  static async signOut() {
    try {
      console.log('🚪 Signing out from Supabase');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        let profile = await this.getUserProfile(user.id);
        
        // If no profile exists, create a basic one for the session
        if (!profile) {
          console.log('📝 Creating basic user profile for current session...');
          profile = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'User',
            role: 'social_worker',
            created_at: new Date().toISOString()
          };
        }
        
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get user profile from database
  static async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If no profile exists, try to get user info from auth and create profile
        if (error.code === 'PGRST116') {
          console.log('🔄 No user profile found, attempting to create one...');
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const newProfile = await this.createUserProfile(user.id, {
              email: user.email,
              name: user.user_metadata?.name || 'User',
              role: 'social_worker'
            });
            return newProfile;
          }
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  // Create user profile in database
  static async createUserProfile(userId, userData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert([
          {
            id: userId,
            name: userData.name || '',
            email: userData.email || '',
            agency: userData.agency || '',
            role: userData.role || 'social_worker',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create user profile error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  // Check if user already exists in the database
  static async checkUserExists(email) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('id, email, name')
        .eq('email', email)
        .maybeSingle(); // Use maybeSingle to avoid error if no rows found

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user existence:', error);
        return null;
      }

      return data; // Returns user data if exists, null if not
    } catch (error) {
      console.error('Check user exists error:', error);
      return null;
    }
  }

  // Check if user already exists in Supabase auth system
  static async checkAuthUserExists(email) {
    try {
      // Try to sign in with a dummy password to check if user exists
      // This is a workaround since Supabase doesn't provide a direct way to check user existence
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-check-12345'
      });

      // If error is "Invalid login credentials", user exists but password is wrong
      // If error is "User not found" or similar, user doesn't exist
      if (error) {
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Invalid email or password')) {
          console.log('🔍 User exists in auth system but password check failed (expected)');
          return true; // User exists
        }
        // User doesn't exist or other error
        return false;
      }

      // If no error, user exists and password was correct (shouldn't happen with dummy password)
      return true;
    } catch (error) {
      console.error('Check auth user exists error:', error);
      return false;
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
} 