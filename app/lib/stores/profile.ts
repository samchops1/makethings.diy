
import { atom } from 'nanostores';
import { ReplitAuthService } from '../services/replitAuth';

interface Profile {
  id?: string;
  username: string;
  bio: string;
  avatar: string;
  isGuest: boolean;
  roles?: string[];
  teams?: string[];
}

// Initialize with guest profile
const initialProfile: Profile = {
  username: 'Guest User',
  bio: '',
  avatar: '',
  isGuest: true,
};

export const profileStore = atom<Profile>(initialProfile);

export const initializeProfile = async () => {
  try {
    const replitUser = await ReplitAuthService.getCurrentUser();
    
    if (replitUser) {
      profileStore.set({
        id: replitUser.id,
        username: replitUser.name,
        bio: replitUser.bio,
        avatar: replitUser.profileImage,
        isGuest: false,
        roles: replitUser.roles,
        teams: replitUser.teams,
      });
    } else {
      // Check localStorage for any stored profile
      const storedProfile = typeof window !== 'undefined' ? localStorage.getItem('bolt_profile') : null;
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        profileStore.set({ ...parsed, isGuest: true });
      }
    }
  } catch (error) {
    console.error('Error initializing profile:', error);
    profileStore.set(initialProfile);
  }
};

export const updateProfile = (updates: Partial<Profile>) => {
  const current = profileStore.get();
  const updated = { ...current, ...updates };
  profileStore.set(updated);

  // Only persist to localStorage if user is guest
  if (updated.isGuest && typeof window !== 'undefined') {
    localStorage.setItem('bolt_profile', JSON.stringify(updated));
  }
};

export const loginWithReplit = () => {
  ReplitAuthService.loginWithReplit();
};

export const logout = () => {
  ReplitAuthService.logout();
  profileStore.set(initialProfile);
};
