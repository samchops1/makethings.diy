import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { profileStore } from '~/lib/stores/profile';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { ReplitLoginButton } from '~/components/auth/ReplitLoginButton';
import { ReplitAuthService } from '~/lib/services/replitAuth';
import { useEffect } from 'react';

export function Header() {
  const chat = useStore(chatStore);
  const profile = useStore(profileStore);

  // Refresh profile on component mount if still showing guest
  useEffect(() => {
    if (profile.isGuest) {
      ReplitAuthService.getCurrentUser().then((user) => {
        if (user) {
          profileStore.set({
            username: user.name || user.id,
            avatar: user.profileImage,
            bio: user.bio,
            isGuest: false,
          });
        }
      });
    }
  }, [profile.isGuest]);

  return (
    <header
      className={classNames('flex items-center justify-between px-4 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer min-w-0 flex-shrink-0">
        <div className="i-ph:sidebar-simple-duotone text-xl" />
        <a href="/" className="text-xl md:text-2xl font-bold text-accent flex items-center hover:scale-105 transition-transform duration-200">
          <span className="text-bolt-elements-textPrimary">&lt;/&gt;</span>
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-extrabold tracking-tight">
            MakeThings
          </span>
          <span className="text-bolt-elements-textSecondary font-medium hidden sm:inline">.Dev</span>
        </a>
      </div>
      {chat.started && ( // Display ChatDescription and HeaderActionButtons only when the chat has started.
        <>
          <div className="flex-1 px-4 min-w-0 text-center">
            <span className="text-bolt-elements-textPrimary truncate block">
              <ClientOnly>{() => <ChatDescription />}</ClientOnly>
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <ClientOnly>
              {() => (
                <>
                  <ReplitLoginButton showUserInfo={false} />
                  <HeaderActionButtons chatStarted={chat.started} />
                </>
              )}
            </ClientOnly>
          </div>
        </>
      )}
      {!chat.started && (
        <div className="flex-shrink-0">
          <ClientOnly>
            {() => <ReplitLoginButton />}
          </ClientOnly>
        </div>
      )}
    </header>
  );
}