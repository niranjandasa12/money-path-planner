
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PieChart, 
  Wallet, 
  BarChart2, 
  Target, 
  User 
} from 'lucide-react';

const NavBar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-finance-primary text-white' : 'text-gray-600 hover:bg-gray-100';
  };

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-finance-primary" />
            <span className="font-bold text-xl text-finance-primary">MoneyPath</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-1">
          <Link 
            to="/dashboard" 
            className={`px-3 py-2 rounded-md font-medium ${isActive('/dashboard')}`}
          >
            <div className="flex items-center space-x-1">
              <PieChart className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
          </Link>
          <Link 
            to="/portfolio" 
            className={`px-3 py-2 rounded-md font-medium ${isActive('/portfolio')}`}
          >
            <div className="flex items-center space-x-1">
              <BarChart2 className="h-4 w-4" />
              <span>Portfolio</span>
            </div>
          </Link>
          <Link 
            to="/transactions" 
            className={`px-3 py-2 rounded-md font-medium ${isActive('/transactions')}`}
          >
            <div className="flex items-center space-x-1">
              <Wallet className="h-4 w-4" />
              <span>Transactions</span>
            </div>
          </Link>
          <Link 
            to="/goals" 
            className={`px-3 py-2 rounded-md font-medium ${isActive('/goals')}`}
          >
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>Goals</span>
            </div>
          </Link>
          <Link 
            to="/advisor" 
            className={`px-3 py-2 rounded-md font-medium ${isActive('/advisor')}`}
          >
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Advisor</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <span className="hidden md:inline text-sm font-medium text-gray-700">
            {user?.fullName}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
        </div>
      </div>
      
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-10">
        <div className="grid grid-cols-5 h-16">
          <Link 
            to="/dashboard" 
            className={`flex flex-col items-center justify-center ${location.pathname === '/dashboard' ? 'text-finance-primary' : 'text-gray-500'}`}
          >
            <PieChart className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link 
            to="/portfolio" 
            className={`flex flex-col items-center justify-center ${location.pathname === '/portfolio' ? 'text-finance-primary' : 'text-gray-500'}`}
          >
            <BarChart2 className="h-5 w-5" />
            <span className="text-xs mt-1">Portfolio</span>
          </Link>
          <Link 
            to="/transactions" 
            className={`flex flex-col items-center justify-center ${location.pathname === '/transactions' ? 'text-finance-primary' : 'text-gray-500'}`}
          >
            <Wallet className="h-5 w-5" />
            <span className="text-xs mt-1">Transactions</span>
          </Link>
          <Link 
            to="/goals" 
            className={`flex flex-col items-center justify-center ${location.pathname === '/goals' ? 'text-finance-primary' : 'text-gray-500'}`}
          >
            <Target className="h-5 w-5" />
            <span className="text-xs mt-1">Goals</span>
          </Link>
          <Link 
            to="/advisor" 
            className={`flex flex-col items-center justify-center ${location.pathname === '/advisor' ? 'text-finance-primary' : 'text-gray-500'}`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Advisor</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
