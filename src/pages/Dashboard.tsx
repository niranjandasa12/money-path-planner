
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ChartCard from '@/components/ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { portfolioService, goalService } from '@/services/api';
import { PortfolioSummary, Goal } from '@/types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, goalsData] = await Promise.all([
          portfolioService.getPortfolioSummary(),
          goalService.getGoals()
        ]);
        
        setSummary(summaryData);
        setGoals(goalsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Generate historical data (mock data)
  const generateHistoricalData = () => {
    const data = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString('default', { month: 'short' });
      const value = 300000 + Math.random() * 100000; // Random value
      data.push({ name: month, value: Math.round(value) });
    }
    return data;
  };

  const historicalData = generateHistoricalData();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Portfolio Value Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">
                ${summary?.totalValue.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Gains/Losses Card */}
        <Card className={`shadow-sm ${summary?.totalGains && summary.totalGains >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Gains/Losses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${summary?.totalGains && summary.totalGains >= 0 ? 'text-finance-success' : 'text-finance-danger'}`}>
                ${summary?.totalGains.toLocaleString()}
              </span>
              <div className={`ml-2 flex items-center ${summary?.totalGains && summary.totalGains >= 0 ? 'text-finance-success' : 'text-finance-danger'}`}>
                {summary?.totalGains && summary.totalGains >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span className="ml-1 text-sm">
                  {summary?.gainPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Progress Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Goals Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-finance-primary" />
              <span className="text-3xl font-bold text-gray-900 ml-2">
                {goals.length}
              </span>
              <span className="ml-2 text-gray-500">active goals</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Portfolio Value Over Time */}
        <ChartCard 
          title="Portfolio Value Over Time" 
          type="area" 
          data={historicalData} 
          dataKey="value"
          nameKey="name"
        />

        {/* Asset Distribution */}
        <ChartCard 
          title="Asset Distribution" 
          type="pie" 
          data={summary?.assetDistribution || []} 
          dataKey="value"
          nameKey="type"
        />
      </div>

      {/* Goals Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Goals Progress</h2>
        <div className="grid grid-cols-1 gap-4">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const deadline = new Date(goal.deadline);
            const formattedDeadline = deadline.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            return (
              <Card key={goal.id} className="shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{goal.name}</h3>
                      <p className="text-sm text-gray-500">Target: ${goal.targetAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${goal.currentAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Deadline: {formattedDeadline}</p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {progress.toFixed(0)}% complete
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
