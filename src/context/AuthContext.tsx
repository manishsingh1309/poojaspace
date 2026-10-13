import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { GoogleUserProfile } from '../types/drive';
import { googleAuthService } from '../services/googleAuthService';

interface AuthContextType {
  isAuthenticated: boolean;
  isConfigured: boolean;
  userProfile: GoogleUserProfile | null;
  token: string | null;
  signIn: () => Promise<boolean>;
  signOut: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(googleAuthService.getToken());
  const [userProfile, setUserProfile] = useState<GoogleUserProfile | null>(
    googleAuthService.getUserProfile()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = googleAuthService.isConfigured();

  const handleStateChange = useCallback(() => {
    setToken(googleAuthService.getToken());
    setUserProfile(googleAuthService.getUserProfile());
  }, []);

  useEffect(() => {
    const unsubscribe = googleAuthService.subscribe(handleStateChange);
    // Initialize token client when GIS is loaded
    googleAuthService.initTokenClient(
      () => {
        handleStateChange();
      },
      (err) => {
        setError(err);
      }
    );

    return () => unsubscribe();
  }, [handleStateChange]);

  const signIn = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await googleAuthService.requestSignIn();
      setIsLoading(false);
      return success;
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setError(msg);
      return false;
    }
  };

  const signOut = () => {
    googleAuthService.signOut();
    setToken(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(token),
        isConfigured,
        userProfile,
        token,
        signIn,
        signOut,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
