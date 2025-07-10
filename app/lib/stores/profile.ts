import { atom } from 'nanostores';
import { ReplitAuthService } from '../services/replitAuth';

interface Profile {
  username: string;
  avatar?: string;
  bio?: string;
  isGuest: boolean;
}

const initialProfile: Profile = {
  username: 'Guest User',
  isGuest: true,
};

export const profileStore = atom<Profile>(initialProfile);

// Initialize profile function
const initializeProfile = async () => {
  try {
    const user = await ReplitAuthService.getCurrentUser();
    if (user) {
      profileStore.set({
        username: user.name || user.id,
        avatar: user.profileImage,
        bio: user.bio,
        isGuest: false,
      });
    }
  } catch (error) {
    console.error('Failed to initialize profile:', error);
  }
};

// Initialize profile on startup and set up periodic checks
if (typeof window !== 'undefined') {
  // Initialize immediately
  initializeProfile();

  // Check auth status periodically in case it changes
  setInterval(initializeProfile, 30000); // Check every 30 seconds
}

export { initializeProfile };

export const loginWithReplit = () => {
  ReplitAuthService.loginWithReplit();
};

export const logout = () => {
  ReplitAuthService.logout();
  profileStore.set(initialProfile);
};