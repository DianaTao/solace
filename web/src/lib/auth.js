import { supabase, TABLES } from './supabase';
import logger from './logger';

export class AuthService {
  // Safe wrapper for Supabase auth operations
  static async safeAuthOperation(operation, operationName) {
    try {
      return await operation();
    } catch (error) {
      // Handle AuthSessionMissingError gracefully
      if (error.message && error.message.includes('Auth session missing')) {
        logger.info(`${operationName}: No auth session (user not logged in)`, 'AUTH');
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  }
  // Sign in with email and password
  static async signIn(credentials) {
    try {
      logger.auth(`Attempting Supabase login with: ${credentials.email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        logger.error('Supabase login error', error, 'AUTH');
        throw error;
      }

      logger.success('Supabase login successful', 'AUTH');

      // Get user profile data - if it fails, create a basic profile
      if (data.user) {
        let profile = await this.getUserProfile(data.user.id);
        
        // If no profile exists, create a basic one for the session
        if (!profile) {
          logger.info('Creating basic user profile for session', 'AUTH');
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
      logger.error('Sign in error', error, 'AUTH');
      throw error;
    }
  }

  // Sign up with email and password
  static async signUp(email, password, userData) {
    try {
      logger.auth(`Attempting Supabase signup with: ${email}`);
      
      // Directly attempt signup - let Supabase handle duplicate email checking
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        logger.error('Supabase signup error', error, 'AUTH');
        
        // Handle specific error cases
        if (error.message.includes('already registered') || 
            error.message.includes('already exists') ||
            error.message.includes('User already registered')) {
          logger.info(`User already exists in auth system: ${email}`, 'AUTH');
          throw new Error('User already registered');
        }
        
        throw error;
      }

      logger.success('Supabase signup successful', 'AUTH');
      logger.debug('Signup data', {
        userCreated: !!data.user,
        userEmail: data.user?.email,
        sessionExists: !!data.session,
        needsConfirmation: !data.session && !!data.user
      }, 'AUTH');

      // Create user profile - with enhanced error handling
      if (data.user) {
        try {
          logger.database(`Creating user profile in database for: ${email}`);
          const profileData = await this.createUserProfile(data.user.id, {
            email,
            ...userData,
          });
          logger.success('User profile created successfully', 'DATABASE');
          logger.debug('Profile data', profileData, 'DATABASE');
        } catch (profileError) {
          logger.error('Failed to create user profile', profileError, 'DATABASE');
          
          // If it's an RLS policy error, the user was created in auth but not in our table
          if (profileError.message.includes('row-level security policy')) {
            logger.warn('User created in auth but profile creation blocked by RLS policy', 'DATABASE');
            // We'll still return the auth data - the profile can be created later
          } else {
            // For other database errors, we might want to clean up the auth user
            logger.error('Database error during profile creation', profileError, 'DATABASE');
          }
        }
      }

      return data;
    } catch (error) {
      logger.error('Sign up error', error, 'AUTH');
      throw error;
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      logger.error('Sign out error', error, 'AUTH');
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
          logger.info('No session found (user not logged in)', 'AUTH');
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
          logger.info('No auth session found (user not logged in)', 'AUTH');
          return null;
        }
        throw error;
      }
      
      if (user) {
        let profile = await this.getUserProfile(user.id);
        
        // If no profile exists, create a basic one for the session
        if (!profile) {
          logger.info('Creating basic user profile for current session', 'AUTH');
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
          logger.info('No user profile found, attempting to create one', 'DATABASE');
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
      logger.error('Get user profile error', error, 'DATABASE');
      return null;
    }
  }

  // Create user profile in database
  static async createUserProfile(userId, userData) {
    try {
      logger.debug('Attempting to insert user profile', {
        id: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'social_worker'
      }, 'DATABASE');

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
        logger.error('Database insert error', error, 'DATABASE');
        logger.debug('Database error details', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        }, 'DATABASE');
        throw error;
      }

      logger.success('User profile inserted successfully', 'DATABASE');
      logger.debug('Profile data', data, 'DATABASE');
      return data;
    } catch (error) {
      logger.error('Create user profile error', error, 'DATABASE');
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
      logger.error('Update user profile error', error, 'DATABASE');
      throw error;
    }
  }

  // Reset password
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      logger.error('Reset password error', error, 'AUTH');
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
      logger.error('Update password error', error, 'AUTH');
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
        logger.error('Error checking user existence', error, 'DATABASE');
        return null;
      }

      return data; // Returns user data if exists, null if not
    } catch (error) {
      logger.error('Check user exists error', error, 'DATABASE');
      return null;
    }
  }

  // REMOVED: checkAuthUserExists function was causing false positives
  // Now letting Supabase handle duplicate email detection directly

  // Manual profile creation for existing auth users without database profiles
  static async createMissingProfile(authUser) {
    try {
      logger.info(`Creating missing profile for auth user: ${authUser.email}`, 'AUTH');
      
      const profileData = await this.createUserProfile(authUser.id, {
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email.split('@')[0] || 'User',
        role: 'social_worker'
      });
      
      logger.success('Missing profile created successfully', 'AUTH');
      logger.debug('Profile data', profileData, 'AUTH');
      return profileData;
    } catch (error) {
      logger.error('Failed to create missing profile', error, 'AUTH');
      throw error;
    }
  }

  // Fix existing auth users who don't have database profiles
  static async fixMissingProfiles() {
    try {
      logger.info('Checking for auth users without database profiles', 'AUTH');
      
      // Get current auth user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.info('No authenticated user found', 'AUTH');
        return null;
      }

      // Check if profile exists
      const existingProfile = await this.getUserProfile(user.id);
      if (existingProfile) {
        logger.info('User profile already exists', 'AUTH');
        return existingProfile;
      }

      // Create missing profile
      logger.info('Creating missing profile for current user', 'AUTH');
      return await this.createMissingProfile(user);
    } catch (error) {
      logger.error('Error fixing missing profiles', error, 'AUTH');
      return null;
    }
  }

  // Utility method to create profile for existing auth users
  static async createProfileForCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        logger.info('No authenticated user found', 'AUTH');
        return null;
      }

      logger.info(`Creating profile for authenticated user: ${user.email}`, 'AUTH');
      
      // Check if profile already exists
      const existingProfile = await this.getUserProfile(user.id);
      if (existingProfile) {
        logger.info('User profile already exists', 'AUTH');
        return existingProfile;
      }

      // Create new profile
      const newProfile = await this.createUserProfile(user.id, {
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        role: 'social_worker'
      });

      logger.success('Profile created for existing user', 'AUTH');
      logger.debug('New profile', newProfile, 'AUTH');
      return newProfile;
    } catch (error) {
      logger.error('Error creating profile for current user', error, 'AUTH');
      throw error;
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
} 