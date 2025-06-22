import { supabase, TABLES } from './supabase';

export class AuthService {
  // Safe wrapper for Supabase auth operations
  static async safeAuthOperation(operation, operationName) {
    try {
      return await operation();
    } catch (error) {
      // Handle AuthSessionMissingError gracefully
      if (error.message && error.message.includes('Auth session missing')) {
        console.log(`ℹ️ ${operationName}: No auth session (user not logged in)`);
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  }
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
      
      // Directly attempt signup - let Supabase handle duplicate email checking
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        console.error('❌ Supabase signup error:', error.message);
        
        // Handle specific error cases
        if (error.message.includes('already registered') || 
            error.message.includes('already exists') ||
            error.message.includes('User already registered')) {
          console.log('👤 User already exists in auth system:', email);
          throw new Error('User already registered');
        }
        
        throw error;
      }

      console.log('✅ Supabase signup successful');
      console.log('📊 Signup data:', {
        userCreated: !!data.user,
        userEmail: data.user?.email,
        sessionExists: !!data.session,
        needsConfirmation: !data.session && !!data.user
      });

      // Create user profile - with enhanced error handling
      if (data.user) {
        try {
          console.log('📝 Creating user profile in database for:', email);
          const profileData = await this.createUserProfile(data.user.id, {
            email,
            ...userData,
          });
          console.log('✅ User profile created successfully:', profileData);
        } catch (profileError) {
          console.error('❌ Failed to create user profile:', profileError);
          
          // If it's an RLS policy error, the user was created in auth but not in our table
          if (profileError.message.includes('row-level security policy')) {
            console.log('⚠️ User created in auth but profile creation blocked by RLS policy');
            // We'll still return the auth data - the profile can be created later
          } else {
            // For other database errors, we might want to clean up the auth user
            console.error('💥 Database error during profile creation:', profileError.message);
          }
        }
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
    return await this.safeAuthOperation(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Handle AuthSessionMissingError gracefully
      if (error) {
        if (error.message.includes('Auth session missing')) {
          console.log('ℹ️ No session found (user not logged in)');
          return null;
        }
        throw error;
      }
      
      return session;
    }, 'getCurrentSession');
  }

  // Get current user
  static async getCurrentUser() {
    return await this.safeAuthOperation(async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      // Handle AuthSessionMissingError gracefully
      if (error) {
        if (error.message.includes('Auth session missing')) {
          console.log('ℹ️ No auth session found (user not logged in)');
          return null;
        }
        throw error;
      }
      
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
    }, 'getCurrentUser');
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
      console.log('🔍 Attempting to insert user profile:', {
        id: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'social_worker'
      });

      const profileData = {
        id: userId,
        name: userData.name || '',
        email: userData.email || '',
        agency: userData.agency || '',
        role: userData.role || 'social_worker',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('❌ Database insert error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ User profile inserted successfully:', data);
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

  // REMOVED: checkAuthUserExists function was causing false positives
  // Now letting Supabase handle duplicate email detection directly

  // Utility method to create profile for existing auth users
  static async createProfileForCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('❌ No authenticated user found');
        return null;
      }

      console.log('🔍 Creating profile for authenticated user:', user.email);
      
      // Check if profile already exists
      const existingProfile = await this.getUserProfile(user.id);
      if (existingProfile) {
        console.log('✅ User profile already exists');
        return existingProfile;
      }

      // Create new profile
      const newProfile = await this.createUserProfile(user.id, {
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        role: 'social_worker'
      });

      console.log('✅ Profile created for existing user:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('❌ Error creating profile for current user:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
} 