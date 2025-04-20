
import {
  User,
  PortfolioItem,
  Transaction,
  Goal,
  Advisor,
  AdvisorMeeting,
  PortfolioSummary,
  TransactionType,
  AssetType
} from '../types';

import {
  currentUser,
  portfolioItems,
  transactions,
  goals,
  advisors,
  advisorMeetings,
  getPortfolioSummary
} from './mockData';
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

// Portfolio services
export const portfolioService = {
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    await delay(500);
    return [...portfolioItems];
  },
  
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    await delay(300);
    return getPortfolioSummary();
  },
  
  async addPortfolioItem(item: Omit<PortfolioItem, 'id' | 'userId' | 'createdAt'>): Promise<PortfolioItem> {
    await delay(500);
    
    const newItem: PortfolioItem = {
      id: portfolioItems.length + 1,
      userId: currentUser.id,
      ...item,
      createdAt: new Date().toISOString()
    };
    
    portfolioItems.push(newItem);
    
    // Also add a corresponding transaction
    const newTransaction: Transaction = {
      id: transactions.length + 1,
      userId: currentUser.id,
      date: new Date().toISOString(),
      type: 'Buy',
      assetName: item.assetName,
      quantity: item.quantity,
      price: item.purchasePrice,
      notes: `Added to portfolio`
    };
    
    transactions.push(newTransaction);
    toast.success('Portfolio item added successfully');
    
    return newItem;
  },
  
  async updatePortfolioItem(id: number, updates: Partial<PortfolioItem>): Promise<PortfolioItem> {
    await delay(500);
    
    const itemIndex = portfolioItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Portfolio item not found');
    }
    
    const updatedItem = {
      ...portfolioItems[itemIndex],
      ...updates
    };
    
    portfolioItems[itemIndex] = updatedItem;
    toast.success('Portfolio item updated successfully');
    
    return updatedItem;
  },
  
  async deletePortfolioItem(id: number): Promise<void> {
    await delay(500);
    
    const itemIndex = portfolioItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Portfolio item not found');
    }
    
    portfolioItems.splice(itemIndex, 1);
    toast.success('Portfolio item deleted successfully');
  }
};

// Transaction services
export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    await delay(500);
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  
  async addTransaction(transaction: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction> {
    await delay(500);
    
    const newTransaction: Transaction = {
      id: transactions.length + 1,
      userId: currentUser.id,
      ...transaction
    };
    
    transactions.push(newTransaction);
    
    // If it's a buy/sell transaction, update the related portfolio item
    if ((transaction.type === 'Buy' || transaction.type === 'Sell') && 
        transaction.assetName && 
        transaction.quantity) {
      
      // Find the portfolio item
      let portfolioItem = portfolioItems.find(item => 
        item.assetName === transaction.assetName
      );
      
      if (portfolioItem) {
        // Update the quantity
        const quantityChange = transaction.type === 'Buy' ? 
          transaction.quantity : -transaction.quantity;
        
        portfolioItem.quantity += quantityChange;
        
        // Update the current value based on the new quantity
        const pricePerUnit = portfolioItem.currentValue / (portfolioItem.quantity - quantityChange);
        portfolioItem.currentValue = portfolioItem.quantity * pricePerUnit;
      } else if (transaction.type === 'Buy') {
        // If buying a new asset, add it to the portfolio
        const newPortfolioItem: PortfolioItem = {
          id: portfolioItems.length + 1,
          userId: currentUser.id,
          assetName: transaction.assetName,
          assetType: 'Other' as AssetType, // Default type, would be specified in a real app
          quantity: transaction.quantity,
          purchasePrice: transaction.price,
          currentValue: transaction.price * transaction.quantity,
          createdAt: transaction.date
        };
        
        portfolioItems.push(newPortfolioItem);
      }
    }
    
    toast.success('Transaction added successfully');
    return newTransaction;
  },
  
  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction> {
    await delay(500);
    
    const transactionIndex = transactions.findIndex(t => t.id === id);
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }
    
    const updatedTransaction = {
      ...transactions[transactionIndex],
      ...updates
    };
    
    transactions[transactionIndex] = updatedTransaction;
    toast.success('Transaction updated successfully');
    
    return updatedTransaction;
  },
  
  async deleteTransaction(id: number): Promise<void> {
    await delay(500);
    
    const transactionIndex = transactions.findIndex(t => t.id === id);
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }
    
    transactions.splice(transactionIndex, 1);
    toast.success('Transaction deleted successfully');
  }
};

// Goal services
export const goalService = {
  async getGoals(): Promise<Goal[]> {
    await delay(500);
    return [...goals];
  },
  
  async addGoal(goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>): Promise<Goal> {
    await delay(500);
    
    const newGoal: Goal = {
      id: goals.length + 1,
      userId: currentUser.id,
      ...goal,
      createdAt: new Date().toISOString()
    };
    
    goals.push(newGoal);
    toast.success('Goal added successfully');
    
    return newGoal;
  },
  
  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal> {
    await delay(500);
    
    const goalIndex = goals.findIndex(g => g.id === id);
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }
    
    const updatedGoal = {
      ...goals[goalIndex],
      ...updates
    };
    
    goals[goalIndex] = updatedGoal;
    toast.success('Goal updated successfully');
    
    return updatedGoal;
  },
  
  async deleteGoal(id: number): Promise<void> {
    await delay(500);
    
    const goalIndex = goals.findIndex(g => g.id === id);
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }
    
    goals.splice(goalIndex, 1);
    toast.success('Goal deleted successfully');
  }
};

// Advisor services
export const advisorService = {
  async getAdvisors(): Promise<Advisor[]> {
    await delay(500);
    return [...advisors];
  },
  
  async getAdvisorMeetings(): Promise<AdvisorMeeting[]> {
    await delay(500);
    return [...advisorMeetings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
  
  async scheduleAdvisorMeeting(meeting: Omit<AdvisorMeeting, 'id' | 'userId' | 'advisor'>): Promise<AdvisorMeeting> {
    await delay(500);
    
    const advisor = advisors.find(a => a.id === meeting.advisorId);
    if (!advisor) {
      throw new Error('Advisor not found');
    }
    
    const newMeeting: AdvisorMeeting = {
      id: advisorMeetings.length + 1,
      userId: currentUser.id,
      ...meeting,
      advisor
    };
    
    advisorMeetings.push(newMeeting);
    toast.success('Meeting scheduled successfully');
    
    return newMeeting;
  },
  
  async cancelAdvisorMeeting(id: number): Promise<void> {
    await delay(500);
    
    const meetingIndex = advisorMeetings.findIndex(m => m.id === id);
    if (meetingIndex === -1) {
      throw new Error('Meeting not found');
    }
    
    advisorMeetings.splice(meetingIndex, 1);
    toast.success('Meeting cancelled successfully');
  }
};
