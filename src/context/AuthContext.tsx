import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, FamilyProfile } from '../types';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: User | null;
  activeProfile: FamilyProfile | null;
  familyProfiles: FamilyProfile[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  addFamilyProfile: (profile: Omit<FamilyProfile, 'id' | 'userId' | 'createdAt'>) => void;
  switchProfile: (profileId: string | null) => void;
  deleteFamilyProfile: (profileId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeProfile, setActiveProfile] = useState<FamilyProfile | null>(null);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      // Prevent multiple simultaneous profile loads
      if (isLoading) {
        console.log('Skipping auth state change - operation already in progress');
        return;
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, loading profile...');
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state...');
        setUser(null);
        setActiveProfile(null);
        setFamilyProfiles([]);
      } else if (event === 'INITIAL_SESSION' && session?.user) {
        console.log('Initial session detected, loading profile...');
        await loadUserProfile(session.user.id);
      }
    });
    
    // Cleanup function
    return () => {
      console.log('Cleaning up auth listener...');
      subscription?.unsubscribe();
    };
  }, [isLoading]);

  const loadUserProfile = async (userId: string): Promise<boolean> => {
    // Prevent multiple simultaneous profile loads
    if (isLoading) {
      console.log('⏳ [loadUserProfile] Skipping - profile load already in progress');
      return false;
    }
    
    console.log('🔍 [loadUserProfile] Starting to load user profile for ID:', userId);
    setIsLoading(true);
    
    try {
      console.log('1. Loading user profile for user ID:', userId);
      
      // 1. Get the current auth user to ensure we have the latest data
      console.log('🔑 Getting current auth user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      console.log('🔑 Auth user data:', { 
        user: user ? { id: user.id, email: user.email } : 'No user', 
        userError: userError?.message 
      });
      
      if (!user) {
        console.error('❌ No auth user found');
        toast.error('Kullanıcı bilgileri alınamadı');
        setIsLoading(false);
        return false;
      }
      
      // 2. Check if user exists in the database
      console.log('🔍 Checking if user exists in the database...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('📊 Database query result:', { 
        data: data ? { id: data.id, email: data.email } : 'No data',
        error: error?.message 
      });
      
      let userProfile = data;
      
      // 3. If user doesn't exist, create a new profile
      if (error || !userProfile) {
        console.log('2. User not found in database, creating new profile...');
        
        const username = user.email?.split('@')[0] || 'user';
        const newProfile = {
          id: user.id,
          email: user.email,
          username: username,
          theme: 'light' as const,
          is_admin: user.email === 'admin@dozasistan.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avatar_url: ''
        };
        
        console.log('3. Inserting new user profile:', newProfile);
        const { error: insertError, data: insertedData } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single();
          
        if (insertError) {
          console.error('❌ Error creating user profile:', insertError);
          toast.error('Profil oluşturulurken hata oluştu: ' + insertError.message);
          return false;
        }
        
        console.log('✅ New user profile created successfully');
        userProfile = insertedData;
      }
      
      // 4. If we have a user profile, set up the session
      if (userProfile) {
        const userSession = {
          id: userProfile.id,
          username: userProfile.username || userProfile.email?.split('@')[0] || 'user',
          email: userProfile.email,
          avatar: userProfile.avatar_url,
          theme: userProfile.theme || 'light',
          createdAt: userProfile.created_at,
          isAdmin: userProfile.is_admin || false
        };
        
        console.log('4. Setting user session:', userSession);
        
        // Update user state
        setUser(userSession);
        
        // 5. Load family profiles
        console.log('5. Loading family profiles...');
        await loadFamilyProfiles(userId);
        
        // 6. Apply theme
        console.log('6. Applying theme...');
        applyTheme(userSession.theme);
        
        console.log('✅ User profile loaded successfully');
        setIsLoading(false);
        return true;
      }
      
      console.warn('⚠️ No user profile available');
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      toast.error('Profil yüklenirken hata oluştu');
      setIsLoading(false);
      return false;
    } finally {
      // Make sure to always set loading to false
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  const loadFamilyProfiles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('family_profiles')
        .select('*')
        .eq('user_id', userId);
      
      if (!error && data) {
        const profiles = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          relationship: p.relationship,
          birthDate: p.birth_date,
          userId: p.user_id,
          isActive: p.is_active,
          createdAt: p.created_at
        }));
        setFamilyProfiles(profiles);
        
        // Load active profile from localStorage (temporary)
        const activeProfileId = localStorage.getItem(`medireminder_active_profile_${userId}`);
        if (activeProfileId) {
          const profile = profiles.find((p: FamilyProfile) => p.id === activeProfileId);
          setActiveProfile(profile || null);
        }
      }
    } catch (error) {
      console.error('Error loading family profiles:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (isLoading) {
      console.log('⏳ [login] Login already in progress, skipping...');
      return false;
    }
    
    console.log('🔑 [login] Starting login process for email:', email);
    setIsLoading(true);
    
    try {
      console.log('🔑 [login] Attempting to sign in with password...');
      
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      console.log('🔑 [login] Sign in response:', { 
        hasUser: !!data?.user,
        session: !!data?.session,
        error: error?.message || 'No error'
      });
      
      if (error) {
        const errorMessage = error.message || 'Bilinmeyen hata';
        console.error('❌ [login] Login failed:', errorMessage);
        console.error('Error details:', error);
        
        // More specific error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Hatalı email veya şifre');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Lütfen email adresinizi doğrulayın');
        } else {
          toast.error('Giriş başarısız: ' + errorMessage);
        }
        
        return false;
      }
      
      if (data?.user) {
        console.log('✅ [login] Authentication successful, loading user profile...');
        console.log('👤 User ID:', data.user.id);
        
        // Small delay to ensure auth state is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const profileLoaded = await loadUserProfile(data.user.id);
        console.log('📝 [login] Profile loading result:', profileLoaded);
        
        if (profileLoaded) {
          console.log('🎉 [login] User successfully logged in and profile loaded');
          toast.success('Başarıyla giriş yapıldı!');
          return true;
        } else {
          console.error('❌ [login] Failed to load user profile');
          // Don't show error here, it will be shown by loadUserProfile
          return false;
        }
      } else {
        console.error('❌ [login] No user data in response');
        toast.error('Giriş başarısız: Kullanıcı bilgileri alınamadı');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Giriş sırasında hata oluştu: ' + (error as Error).message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Register attempt with:', { email, username, passwordLength: password.length });
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      });
      
      console.log('Register response:', { data, error });
      
      if (!error && data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            username: username,
            email: email,
            theme: 'light',
            is_admin: email === 'admin@dozasistan.com'
          });
        
        if (!profileError) {
          await loadUserProfile(data.user.id);
          toast.success('Hesap başarıyla oluşturuldu!');
          setIsLoading(false);
          return true;
        } else {
          toast.error('Profil oluşturma hatası: ' + profileError.message);
        }
      } else {
        toast.error('Kayıt başarısız: ' + (error?.message || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Kayıt sırasında hata oluştu');
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveProfile(null);
    setFamilyProfiles([]);
    // Clear only active profile localStorage data
    if (user?.id) {
      localStorage.removeItem(`medireminder_active_profile_${user.id}`);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: updates.username,
          theme: updates.theme
        })
        .eq('id', user.id);
      
      if (!error) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        
        if (updates.theme) {
          applyTheme(updates.theme);
        }
        
        toast.success('Profil güncellendi');
      } else {
        toast.error('Profil güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profil güncellenirken hata oluştu');
    }
  };

  const addFamilyProfile = async (profileData: Omit<FamilyProfile, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('family_profiles')
        .insert({
          user_id: user.id,
          name: profileData.name,
          relationship: profileData.relationship,
          birth_date: profileData.birthDate,
          is_active: profileData.isActive
        })
        .select()
        .single();
      
      if (!error && data) {
        const newProfile: FamilyProfile = {
          id: data.id,
          name: data.name,
          relationship: data.relationship,
          birthDate: data.birth_date,
          userId: data.user_id,
          isActive: data.is_active,
          createdAt: data.created_at
        };
        setFamilyProfiles(prev => [...prev, newProfile]);
      } else {
        toast.error('Profil eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Add family profile error:', error);
      toast.error('Profil eklenirken hata oluştu');
    }
  };

  const switchProfile = (profileId: string | null) => {
    if (!user) return;
    
    if (profileId) {
      const profile = familyProfiles.find(p => p.id === profileId);
      setActiveProfile(profile || null);
      localStorage.setItem(`medireminder_active_profile_${user.id}`, profileId);
    } else {
      setActiveProfile(null);
      localStorage.removeItem(`medireminder_active_profile_${user.id}`);
    }
  };

  const deleteFamilyProfile = async (profileId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('family_profiles')
        .delete()
        .eq('id', profileId);
      
      if (!error) {
        setFamilyProfiles(prev => prev.filter(p => p.id !== profileId));
        
        if (activeProfile?.id === profileId) {
          setActiveProfile(null);
          localStorage.removeItem(`medireminder_active_profile_${user.id}`);
        }
        
        toast.success('Profil silindi');
      } else {
        toast.error('Profil silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Delete family profile error:', error);
      toast.error('Profil silinirken hata oluştu');
    }
  };

  const applyTheme = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const value = {
    user,
    activeProfile,
    familyProfiles,
    login,
    register,
    logout,
    updateProfile,
    addFamilyProfile,
    switchProfile,
    deleteFamilyProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};