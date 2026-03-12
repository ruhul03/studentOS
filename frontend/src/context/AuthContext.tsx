import { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('studentos_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      localStorage.removeItem('studentos_user');
      return null;
    }
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('studentos_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('studentos_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
