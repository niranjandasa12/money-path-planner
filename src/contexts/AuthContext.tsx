
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/api';
import { toast } from 'sonner';

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for stored user session on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await authService.login(email, password);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Login successful');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await authService.signup(fullName, email, password);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Account created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
