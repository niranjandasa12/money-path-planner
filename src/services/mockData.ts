
import {
  User,
  PortfolioItem,
  Transaction,
  Goal,
  Advisor,
  AdvisorMeeting,
  PortfolioSummary
} from '../types';

// Mock user data
export const currentUser: User = {
  id: '1',  // Changed from number 1 to string '1'
  fullName: 'John Smith',
  email: 'john@example.com'
};

// Mock portfolio data
export const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    userId: 1,
    assetName: 'Apple Inc.',
    assetType: 'Stock',
    quantity: 10,
    purchasePrice: 150.00,
    currentValue: 175.25,
    createdAt: '2023-01-15T10:30:00'
  },
  {
    id: 2,
    userId: 1,
    assetName: 'Microsoft Corp',
    assetType: 'Stock',
    quantity: 5,
    purchasePrice: 220.50,
    currentValue: 250.75,
    createdAt: '2023-03-05T09:45:00'
  },
  {
    id: 3,
    userId: 1,
    assetName: 'Bitcoin',
    assetType: 'Cryptocurrency',
    quantity: 0.5,
    purchasePrice: 35000.00,
    currentValue: 42000.00,
    createdAt: '2023-04-20T14:15:00'
  },
  {
    id: 4,
    userId: 1,
    assetName: 'Ethereum',
    assetType: 'Cryptocurrency',
    quantity: 2.5,
    purchasePrice: 2500.00,
    currentValue: 3200.00,
    createdAt: '2023-05-12T16:30:00'
  },
  {
    id: 5,
    userId: 1,
    assetName: 'Rental Property',
    assetType: 'Real Estate',
    quantity: 1,
    purchasePrice: 250000.00,
    currentValue: 300000.00,
    createdAt: '2023-09-30T10:00:00'
  },
  {
    id: 6,
    userId: 1,
    assetName: 'S&P 500 ETF',
    assetType: 'ETF',
    quantity: 20,
    purchasePrice: 400.00,
    currentValue: 425.50,
    createdAt: '2023-06-01T13:20:00'
  }
];

// Mock transactions data
export const transactions: Transaction[] = [
  {
    id: 1,
    userId: 1,
    date: '2023-01-15T10:30:00',
    type: 'Buy',
    assetName: 'Apple Inc.',
    quantity: 5,
    price: 145.00,
    notes: 'Initial investment'
  },
  {
    id: 2,
    userId: 1,
    date: '2023-02-10T11:25:00',
    type: 'Buy',
    assetName: 'Apple Inc.',
    quantity: 5,
    price: 155.00,
    notes: 'Dollar-cost averaging'
  },
  {
    id: 3,
    userId: 1,
    date: '2023-03-05T09:45:00',
    type: 'Buy',
    assetName: 'Microsoft Corp',
    quantity: 5,
    price: 220.50,
    notes: 'Portfolio diversification'
  },
  {
    id: 4,
    userId: 1,
    date: '2023-04-20T14:15:00',
    type: 'Buy',
    assetName: 'Bitcoin',
    quantity: 0.5,
    price: 35000.00,
    notes: 'Crypto exposure'
  },
  {
    id: 5,
    userId: 1,
    date: '2023-05-12T16:30:00',
    type: 'Buy',
    assetName: 'Ethereum',
    quantity: 2.5,
    price: 2500.00,
    notes: 'Blockchain investment'
  },
  {
    id: 6,
    userId: 1,
    date: '2023-06-01T13:20:00',
    type: 'Buy',
    assetName: 'S&P 500 ETF',
    quantity: 10,
    price: 395.00,
    notes: 'Index fund investment'
  },
  {
    id: 7,
    userId: 1,
    date: '2023-07-15T15:45:00',
    type: 'Buy',
    assetName: 'S&P 500 ETF',
    quantity: 10,
    price: 405.00,
    notes: 'Regular investment'
  },
  {
    id: 8,
    userId: 1,
    date: '2023-09-30T10:00:00',
    type: 'Buy',
    assetName: 'Rental Property',
    quantity: 1,
    price: 250000.00,
    notes: 'Investment property purchase'
  },
  {
    id: 9,
    userId: 1,
    date: '2023-12-10T12:30:00',
    type: 'Deposit',
    price: 10000.00,
    notes: 'Year-end bonus deposit'
  }
];

// Mock goals data
export const goals: Goal[] = [
  {
    id: 1,
    userId: 1,
    name: 'Retirement Fund',
    targetAmount: 1000000.00,
    currentAmount: 350000.00,
    deadline: '2045-12-31',
    createdAt: '2023-01-01T00:00:00'
  },
  {
    id: 2,
    userId: 1,
    name: 'House Down Payment',
    targetAmount: 60000.00,
    currentAmount: 35000.00,
    deadline: '2025-06-30',
    createdAt: '2023-02-15T00:00:00'
  },
  {
    id: 3,
    userId: 1,
    name: 'Emergency Fund',
    targetAmount: 25000.00,
    currentAmount: 15000.00,
    deadline: '2024-03-31',
    createdAt: '2023-03-20T00:00:00'
  },
  {
    id: 4,
    userId: 1,
    name: 'Vacation',
    targetAmount: 5000.00,
    currentAmount: 2500.00,
    deadline: '2024-07-15',
    createdAt: '2023-04-10T00:00:00'
  }
];

// Mock advisors data
export const advisors: Advisor[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@financialadvisor.com',
    expertise: 'Retirement Planning',
    imageUrl: 'https://randomuser.me/api/portraits/women/45.jpg'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael@financialadvisor.com',
    expertise: 'Tax Strategy',
    imageUrl: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
  {
    id: 3,
    name: 'Emma Wilson',
    email: 'emma@financialadvisor.com',
    expertise: 'Real Estate Investment',
    imageUrl: 'https://randomuser.me/api/portraits/women/33.jpg'
  }
];

// Mock advisor meetings data
export const advisorMeetings: AdvisorMeeting[] = [
  {
    id: 1,
    userId: 1,
    advisorId: 1,
    date: '2024-05-25T14:00:00',
    topic: 'Retirement Planning Review',
    advisor: advisors[0]
  },
  {
    id: 2,
    userId: 1,
    advisorId: 2,
    date: '2024-05-30T11:30:00',
    topic: 'Tax Optimization Strategies',
    advisor: advisors[1]
  },
  {
    id: 3,
    userId: 1,
    advisorId: 3,
    date: '2024-06-05T15:30:00',
    topic: 'Real Estate Portfolio Expansion',
    advisor: advisors[2]
  }
];

// Portfolio summary calculations
export const getPortfolioSummary = (): PortfolioSummary => {
  // Calculate total values
  const totalCurrentValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
  const totalPurchaseValue = portfolioItems.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
  const totalGains = totalCurrentValue - totalPurchaseValue;
  const gainPercentage = (totalGains / totalPurchaseValue) * 100;

  // Calculate asset distribution
  const assetTypeMap = new Map<string, number>();
  
  portfolioItems.forEach(item => {
    const currentTypeValue = assetTypeMap.get(item.assetType) || 0;
    assetTypeMap.set(item.assetType, currentTypeValue + item.currentValue);
  });
  
  const assetDistribution = Array.from(assetTypeMap.entries()).map(([type, value]) => ({
    type,
    value,
    percentage: (value / totalCurrentValue) * 100
  }));

  return {
    totalValue: totalCurrentValue,
    totalGains,
    gainPercentage,
    assetDistribution
  };
};
