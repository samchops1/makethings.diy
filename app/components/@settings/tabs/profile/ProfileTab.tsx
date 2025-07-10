import { useState, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { classNames } from '~/utils/classNames';
import { profileStore, updateProfile, loginWithReplit, logout } from '~/lib/stores/profile';
import { toast } from 'react-toastify';
import { debounce } from '~/utils/debounce';
import { ReplitLoginButton } from '~/components/auth/ReplitLoginButton';

export default function ProfileTab() {
  const profile = useStore(profileStore);
  const [isUploading, setIsUploading] = useState(false);

  // Create debounced update functions
  const debouncedUpdate = useCallback(
    debounce((field: 'username' | 'bio', value: string) => {
      updateProfile({ [field]: value });
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
    }, 1000),
    [],
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploading(true);

      // Convert the file to base64
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateProfile({ avatar: base64String });
        setIsUploading(false);
        toast.success('Profile picture updated');
      };

      reader.onerror = () => {
        console.error('Error reading file:', reader.error);
        setIsUploading(false);
        toast.error('Failed to update profile picture');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setIsUploading(false);
      toast.error('Failed to update profile picture');
    }
  };

  const handleProfileUpdate = (field: 'username' | 'bio', value: string) => {
    // Update the store immediately for UI responsiveness
    updateProfile({ [field]: value });

    // Debounce the toast notification
    debouncedUpdate(field, value);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-bolt-elements-textPrimary">Profile Settings</h2>

      <div className="space-y-6 max-w-md">
        {/* Authentication Status */}
        <div className="p-4 border border-bolt-elements-borderColor rounded-lg">
          <h3 className="text-lg font-medium mb-3 text-bolt-elements-textPrimary">Authentication</h3>

          {profile.isGuest ? (
            <div className="space-y-3">
              <p className="text-sm text-bolt-elements-textSecondary">
                You are currently using a guest account. Login with Replit to sync your profile across devices.
              </p>
              <ReplitLoginButton />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {profile.avatar && (
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-bolt-elements-textPrimary">{profile.username}</p>
                  <p className="text-sm text-green-600">Connected to Replit</p>
                  {profile.id && (
                    <p className="text-xs text-bolt-elements-textSecondary">ID: {profile.id}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </Button>
            </div>
          )}
        </div>

        {/* Local Profile Settings (only for guest users) */}
        {profile.isGuest && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-bolt-elements-textPrimary">Guest Profile</h3>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Username</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <div className="i-ph:user-circle-fill w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
                </div>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => handleProfileUpdate('username', e.target.value)}
                  className={classNames(
                    'w-full pl-11 pr-4 py-2.5 rounded-xl',
                    'bg-white dark:bg-gray-800/50',
                    'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    'transition-all duration-300 ease-out',
                  )}
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Bio</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-3">
                  <div className="i-ph:text-aa w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
                </div>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                  className={classNames(
                    'w-full pl-11 pr-4 py-2.5 rounded-xl',
                    'bg-white dark:bg-gray-800/50',
                    'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    'transition-all duration-300 ease-out',
                    'resize-none',
                    'h-32',
                  )}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Avatar URL</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <div className="i-ph:image-square-fill w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
                </div>
                <input
                  type="text"
                  value={profile.avatar}
                  onChange={(e) => updateProfile({ avatar: e.target.value })}
                  className={classNames(
                    'w-full pl-11 pr-4 py-2.5 rounded-xl',
                    'bg-white dark:bg-gray-800/50',
                    'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    'transition-all duration-300 ease-out',
                  )}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            {profile.avatar && (
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Preview</label>
                <img
                  src={profile.avatar}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full mt-2"
                />
              </div>
            )}
          </div>
        )}

        {/* Read-only profile for authenticated users */}
        {!profile.isGuest && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-bolt-elements-textPrimary">Replit Profile</h3>
            <p className="text-sm text-bolt-elements-textSecondary">
              Your profile information is managed by Replit and cannot be edited here.
            </p>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Bio</label>
                <p className="text-sm text-bolt-elements-textPrimary">{profile.bio || 'No bio available'}</p>
              </div>

              {profile.roles && profile.roles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Roles</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.roles.map((role, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-bolt-elements-background-depth-2 rounded"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}