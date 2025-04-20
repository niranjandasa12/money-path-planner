
import {
  User,
  PortfolioItem,
  Transaction,
  Goal,
  PortfolioSummary,
  TransactionType,
  AssetType
} from '../types';

import {
  currentUser,
  getPortfolioSummary
} from './mockData';
import { goalService } from './goals';
import { portfolioService } from './portfolios';
import { transactionService } from './transactions';
import { advisorService } from './advisors';
import { toast } from 'sonner';

// Simulating API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication services
export const authService = {
  async login(email: string, password: string): Promise<User> {
    // Simulate API call
    await delay(800);
    
    // In a real app, this would validate against a backend
    if (email === 'john@example.com' && password === 'password123') {
      // Mock successful login
      return currentUser;
    }
    
    throw new Error('Invalid credentials');
  },
  
  async signup(fullName: string, email: string, password: string): Promise<User> {
    // Simulate API call
    await delay(800);
    
    // In a real app, this would create a new user in the backend
    // For demo purposes, we'll simulate a successful signup with mock data
    
    // Check if email is already in use (just check against our mock user)
    if (email === currentUser.email) {
      throw new Error('Email already in use');
    }
    
    // Return mock user (in a real app, this would be the newly created user)
    return currentUser;
  }
};

// Export other services directly - they now use Supabase directly
export { 
  portfolioService,
  transactionService,
  goalService,
  advisorService
};
