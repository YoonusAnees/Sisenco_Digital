import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, LoginPayload, RegisterPayload, RegisterAdminPayload } from '@/api/authApi';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  registerAdmin: (payload: RegisterAdminPayload) => Promise<User>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refetchUser = useCallback(async () => {
    try {
      const data = await authApi.getCurrentUser();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const login = async (payload: LoginPayload): Promise<User> => {
    const data = await authApi.login(payload);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    const data = await authApi.register(payload);
    setUser(data.user);
    return data.user;
  };

  const registerAdmin = async (payload: RegisterAdminPayload): Promise<User> => {
    const data = await authApi.registerAdmin(payload);
    setUser(data.user);
    return data.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        registerAdmin,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
