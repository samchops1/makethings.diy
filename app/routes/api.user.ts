
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Extract Replit user headers
    const userId = request.headers.get('X-Replit-User-Id');
    const userName = request.headers.get('X-Replit-User-Name');
    const userProfileImage = request.headers.get('X-Replit-User-Profile-Image');
    const userBio = request.headers.get('X-Replit-User-Bio');
    const userUrl = request.headers.get('X-Replit-User-Url');
    const userRoles = request.headers.get('X-Replit-User-Roles');
    const userTeams = request.headers.get('X-Replit-User-Teams');

    // Log the current domain for debugging
    const host = request.headers.get('host');
    console.log('Current host:', host);

    if (!userId) {
      return json({ 
        authenticated: false, 
        user: null, 
        error: 'No user ID found in headers',
        host: host 
      });
    }

    const user = {
      id: userId,
      name: userName || '',
      profileImage: userProfileImage || '',
      bio: userBio || '',
      url: userUrl || '',
      roles: userRoles ? userRoles.split(',') : [],
      teams: userTeams ? userTeams.split(',') : [],
    };

    return json({ authenticated: true, user });
  } catch (error) {
    console.error('Error getting user info:', error);
    return json({ authenticated: false, user: null });
  }
}
