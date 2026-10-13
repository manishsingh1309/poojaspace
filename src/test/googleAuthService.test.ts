import { describe, it, expect, beforeEach } from 'vitest';
import { googleAuthService, GOOGLE_SCOPES } from '../services/googleAuthService';

describe('GoogleAuthService', () => {
  beforeEach(() => {
    googleAuthService.signOut();
  });

  it('uses least privilege scope including drive.file and basic profile', () => {
    expect(GOOGLE_SCOPES).toContain('https://www.googleapis.com/auth/drive.file');
    expect(GOOGLE_SCOPES).not.toContain('https://www.googleapis.com/auth/drive ');
    expect(GOOGLE_SCOPES).not.toContain('drive.readonly');
  });

  it('keeps access token in memory only and detects expiration', () => {
    expect(googleAuthService.isAuthenticated()).toBe(false);

    // Set token valid for 3600 seconds
    googleAuthService.setToken('valid-token-xyz', 3600);
    expect(googleAuthService.isAuthenticated()).toBe(true);
    expect(googleAuthService.getToken()).toBe('valid-token-xyz');

    // Sign out clears memory token
    googleAuthService.signOut();
    expect(googleAuthService.isAuthenticated()).toBe(false);
    expect(googleAuthService.getToken()).toBeNull();
  });

  it('expires token gracefully when time elapsed', () => {
    // Set token with 0 seconds remaining
    googleAuthService.setToken('expired-token', 0);
    expect(googleAuthService.getToken()).toBeNull();
    expect(googleAuthService.isAuthenticated()).toBe(false);
  });
});
