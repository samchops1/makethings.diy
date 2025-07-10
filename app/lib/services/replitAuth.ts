
interface ReplitUser {
  id: string;
  name: string;
  profileImage: string;
  bio: string;
  url: string;
  roles: string[];
  teams: string[];
}

export class ReplitAuthService {
  static async getCurrentUser(): Promise<ReplitUser | null> {
    try {
      // First try the standard Replit auth endpoint
      let response = await fetch('/__replauthuser');
      if (response.ok) {
        return await response.json();
      }

      // Fallback to our API route that reads headers
      response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        return data.authenticated ? data.user : null;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  static loginWithReplit(): void {
    const h = 500;
    const w = 350;
    const left = (screen.width / 2) - (w / 2);
    const top = (screen.height / 2) - (h / 2);

    // Use the current hostname to ensure domain matching
    const currentDomain = window.location.hostname;
    const authWindow = window.open(
      "https://replit.com/auth_with_repl_site?domain=" + currentDomain,
      "_blank",
      "modal=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
        w + ", height=" + h + ", top=" + top + ", left=" + left
    );

    window.addEventListener("message", function authComplete(e) {
      if (e.data !== "auth_complete") {
        return;
      }
      window.removeEventListener("message", authComplete);
      authWindow?.close();
      location.reload();
    });
  }

  static logout(): void {
    // Clear any local storage and redirect to clear auth
    localStorage.clear();
    location.reload();
  }
}
