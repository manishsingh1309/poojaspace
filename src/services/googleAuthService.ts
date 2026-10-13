import { GoogleUserProfile } from '../types/drive';

// Narrow, least-privilege scopes
export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file',
].join(' ');

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse | { error: string }) => void;
            error_callback?: (err: { message: string }) => void;
          }) => GoogleTokenClient;
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

class GoogleAuthService {
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;
  private userProfile: GoogleUserProfile | null = null;
  private tokenClient: GoogleTokenClient | null = null;
  private listeners: Array<() => void> = [];

  public getClientId(): string {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  }

  public isConfigured(): boolean {
    const clientId = this.getClientId();
    return Boolean(clientId && clientId !== 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com');
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l());
  }

  public initTokenClient(onSuccess?: () => void, onError?: (err: string) => void): boolean {
    const clientId = this.getClientId();
    if (!clientId || !window.google?.accounts?.oauth2) {
      return false;
    }

    try {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPES,
        callback: async (resp: TokenResponse | { error: string }) => {
          if ('error' in resp && resp.error) {
            onError?.(resp.error);
            this.notifyListeners();
            return;
          }

          const tokenResp = resp as TokenResponse;
          this.setToken(tokenResp.access_token, tokenResp.expires_in);
          await this.fetchUserProfile();
          onSuccess?.();
          this.notifyListeners();
        },
        error_callback: (err) => {
          onError?.(err?.message || 'Authentication error');
        },
      });
      return true;
    } catch (err) {
      console.warn('Error initializing Google Identity Services Token Client:', err);
      return false;
    }
  }

  constructor() {
    this.loadCachedToken();
  }

  private loadCachedToken(): void {
    if (typeof window === 'undefined') return;
    try {
      const cached = sessionStorage.getItem('poojaspace_oauth_token');
      const expiresAt = sessionStorage.getItem('poojaspace_oauth_expires');
      if (cached && expiresAt) {
        const exp = Number(expiresAt);
        if (exp > Date.now()) {
          this.accessToken = cached;
          this.tokenExpiresAt = exp;
          const cachedProfile = sessionStorage.getItem('poojaspace_user_profile');
          if (cachedProfile) {
            this.userProfile = JSON.parse(cachedProfile);
          } else {
            this.fetchUserProfile();
          }
        } else {
          sessionStorage.removeItem('poojaspace_oauth_token');
          sessionStorage.removeItem('poojaspace_oauth_expires');
          sessionStorage.removeItem('poojaspace_user_profile');
        }
      }
    } catch (e) {
      // Safe fallback
    }
  }

  public setToken(token: string, expiresInSeconds: number): void {
    this.accessToken = token;
    if (expiresInSeconds <= 0) {
      this.tokenExpiresAt = Date.now() - 1000;
    } else {
      // Set expiry 60 seconds early to prevent edge-case mid-request expiration
      this.tokenExpiresAt = Date.now() + Math.max(0, expiresInSeconds - 60) * 1000;
    }

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('poojaspace_oauth_token', token);
        sessionStorage.setItem('poojaspace_oauth_expires', String(this.tokenExpiresAt));
      } catch (e) {
        // Safe fallback
      }
    }
  }

  public getToken(): string | null {
    if (!this.accessToken) return null;
    if (this.tokenExpiresAt && Date.now() >= this.tokenExpiresAt) {
      this.accessToken = null;
      this.tokenExpiresAt = null;
      this.notifyListeners();
      return null;
    }
    return this.accessToken;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  public getUserProfile(): GoogleUserProfile | null {
    return this.userProfile;
  }

  public requestSignIn(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isConfigured()) {
        resolve(false);
        return;
      }

      if (!this.tokenClient) {
        const initialized = this.initTokenClient(
          () => resolve(true),
          () => resolve(false)
        );
        if (!initialized || !this.tokenClient) {
          resolve(false);
          return;
        }
      }

      // Prompt account selection
      this.tokenClient.requestAccessToken({ prompt: 'select_account' });
    });
  }

  public async fetchUserProfile(): Promise<GoogleUserProfile | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        this.userProfile = {
          email: data.email,
          name: data.name || 'Pooja',
          picture: data.picture,
          id: data.sub,
        };
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('poojaspace_user_profile', JSON.stringify(this.userProfile));
          } catch (e) {
            // Safe fallback
          }
        }
        return this.userProfile;
      }
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
    }
    return null;
  }

  public signOut(): void {
    const token = this.accessToken;
    if (token && window.google?.accounts?.oauth2?.revoke) {
      try {
        window.google.accounts.oauth2.revoke(token, () => {});
      } catch (e) {
        // Safe ignore
      }
    }
    this.accessToken = null;
    this.tokenExpiresAt = null;
    this.userProfile = null;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('poojaspace_oauth_token');
        sessionStorage.removeItem('poojaspace_oauth_expires');
        sessionStorage.removeItem('poojaspace_user_profile');
      } catch (e) {
        // Safe fallback
      }
    }
    this.notifyListeners();
  }
}

export const googleAuthService = new GoogleAuthService();
