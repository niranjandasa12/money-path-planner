export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface PortfolioItem {
  id: number;
  userId: number;
  assetName: string;
  assetType: AssetType;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
  createdAt: string;
}

export type AssetType = 'Stock' | 'Cryptocurrency' | 'ETF' | 'Real Estate' | 'Bond' | 'Other';

export interface PortfolioSummary {
  totalValue: number;
  totalGains: number;
  gainPercentage: number;
  assetDistribution: {
    type: string;
    value: number;
    percentage: number;
  }[];
}

export type TransactionType = 'Buy' | 'Sell' | 'Deposit' | 'Withdraw';

export interface Transaction {
  id: number;
  userId: number;
  date: string;
  type: TransactionType;
  assetName?: string;
  quantity?: number;
  price: number;
  notes?: string;
}

export interface Goal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

export interface Advisor {
  id: number;
  name: string;
  email: string;
  expertise: string;
  imageUrl: string;
}

export interface AdvisorMeeting {
  id: number;
  userId: number;
  advisorId: number;
  date: string;
  topic: string;
  advisor?: Advisor;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
