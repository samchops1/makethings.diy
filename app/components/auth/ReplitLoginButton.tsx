
import { useStore } from '@nanostores/react';
import { profileStore, loginWithReplit, logout } from '~/lib/stores/profile';
import { Button } from '~/components/ui/Button';
import { classNames } from '~/utils/classNames';

interface ReplitLoginButtonProps {
  className?: string;
  showUserInfo?: boolean;
}

export function ReplitLoginButton({ className, showUserInfo = true }: ReplitLoginButtonProps) {
  const profile = useStore(profileStore);

  if (profile.isGuest) {
    return (
      <Button
        onClick={loginWithReplit}
        className={classNames(
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
          'bg-purple-500 hover:bg-purple-600 text-white transition-colors',
          className
        )}
      >
        <div className="i-ph:sign-in" />
        Login with Replit
      </Button>
    );
  }

  if (!showUserInfo) {
    return (
      <Button
        onClick={logout}
        className={classNames(
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
          'bg-red-500 hover:bg-red-600 text-white transition-colors',
          className
        )}
      >
        <div className="i-ph:sign-out" />
        Logout
      </Button>
    );
  }

  return (
    <div className={classNames('flex items-center gap-3', className)}>
      <div className="flex items-center gap-2">
        {profile.avatar && (
          <img
            src={profile.avatar}
            alt={profile.username}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-bolt-elements-textPrimary">
            {profile.username}
          </span>
          {profile.bio && (
            <span className="text-xs text-bolt-elements-textSecondary">
              {profile.bio}
            </span>
          )}
        </div>
      </div>
      <Button
        onClick={logout}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
      >
        <div className="i-ph:sign-out" />
        Logout
      </Button>
    </div>
  );
}
