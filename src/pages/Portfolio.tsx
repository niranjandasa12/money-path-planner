
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { portfolioService } from '@/services/api';
import { PortfolioItem, AssetType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const Portfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('value-desc');
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({
    assetName: '',
    assetType: 'Stock',
    quantity: 0,
    purchasePrice: 0,
    currentValue: 0
  });
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await portfolioService.getPortfolioItems();
        setPortfolioItems(data);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolio();
  }, []);
  
  // Handle filter and sort
  const filteredAndSortedItems = portfolioItems
    .filter(item => filter === 'all' || item.assetType === filter)
    .sort((a, b) => {
      switch (sort) {
        case 'name-asc':
          return a.assetName.localeCompare(b.assetName);
        case 'name-desc':
          return b.assetName.localeCompare(a.assetName);
        case 'value-asc':
          return a.currentValue - b.currentValue;
        case 'value-desc':
          return b.currentValue - a.currentValue;
        case 'gain-asc':
          return (a.currentValue - a.purchasePrice * a.quantity) - (b.currentValue - b.purchasePrice * b.quantity);
        case 'gain-desc':
          return (b.currentValue - b.purchasePrice * b.quantity) - (a.currentValue - a.purchasePrice * a.quantity);
        default:
          return 0;
      }
    });
  
  // Calculate total portfolio value and allocation
  const totalValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
  
  // Form handling
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newItem.assetName) {
      newErrors.assetName = 'Asset name is required';
    }
    
    if (!newItem.assetType) {
      newErrors.assetType = 'Asset type is required';
    }
    
    if (!newItem.quantity || newItem.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!newItem.purchasePrice || newItem.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }
    
    if (!newItem.currentValue || newItem.currentValue <= 0) {
      newErrors.currentValue = 'Current value must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddItem = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await portfolioService.addPortfolioItem(newItem as Required<Omit<PortfolioItem, 'id' | 'userId' | 'createdAt'>>);
      const data = await portfolioService.getPortfolioItems();
      setPortfolioItems(data);
      setNewItem({
        assetName: '',
        assetType: 'Stock',
        quantity: 0,
        purchasePrice: 0,
        currentValue: 0
      });
    } catch (error) {
      console.error('Error adding portfolio item:', error);
    }
  };
  
  const handleInputChange = (field: keyof typeof newItem, value: string | number) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate historical data for performance chart (mock data)
  const generatePerformanceData = (item: PortfolioItem) => {
    const data = [];
    const now = new Date();
    const purchaseDate = new Date(item.createdAt);
    const months = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + now.getMonth() - purchaseDate.getMonth();
    
    const startValue = item.purchasePrice * item.quantity;
    const endValue = item.currentValue;
    
    for (let i = 0; i <= months; i++) {
      const date = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + i, 1);
      const month = date.toLocaleString('default', { month: 'short' });
      
      // Linear interpolation for mock data
      const progress = months === 0 ? 1 : i / months;
      const value = startValue + progress * (endValue - startValue);
      
      data.push({ name: month, value: Math.round(value) });
    }
    
    return data;
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <p>Loading portfolio data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const assetTypes: AssetType[] = ['Stock', 'Cryptocurrency', 'ETF', 'Real Estate', 'Bond', 'Other'];
  
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Portfolio</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-finance-primary hover:bg-finance-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="assetName">Asset Name</Label>
                <Input
                  id="assetName"
                  value={newItem.assetName}
                  onChange={(e) => handleInputChange('assetName', e.target.value)}
                  className={errors.assetName ? 'border-red-500' : ''}
                />
                {errors.assetName && <p className="text-red-500 text-xs mt-1">{errors.assetName}</p>}
              </div>
              
              <div>
                <Label htmlFor="assetType">Asset Type</Label>
                <Select
                  value={newItem.assetType as string}
                  onValueChange={(value) => handleInputChange('assetType', value)}
                >
                  <SelectTrigger id="assetType" className={errors.assetType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assetType && <p className="text-red-500 text-xs mt-1">{errors.assetType}</p>}
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity === 0 ? '' : newItem.quantity}
                  onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                  className={errors.quantity ? 'border-red-500' : ''}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>
              
              <div>
                <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={newItem.purchasePrice === 0 ? '' : newItem.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                  className={errors.purchasePrice ? 'border-red-500' : ''}
                />
                {errors.purchasePrice && <p className="text-red-500 text-xs mt-1">{errors.purchasePrice}</p>}
              </div>
              
              <div>
                <Label htmlFor="currentValue">Current Value ($)</Label>
                <Input
                  id="currentValue"
                  type="number"
                  value={newItem.currentValue === 0 ? '' : newItem.currentValue}
                  onChange={(e) => handleInputChange('currentValue', parseFloat(e.target.value) || 0)}
                  className={errors.currentValue ? 'border-red-500' : ''}
                />
                {errors.currentValue && <p className="text-red-500 text-xs mt-1">{errors.currentValue}</p>}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddItem} className="bg-finance-primary hover:bg-finance-primary/90">Add Asset</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="shadow-sm mb-6">
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Value</p>
              <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Asset Allocation</p>
              <div className="space-y-2">
                {assetTypes.map(type => {
                  const typeTotal = portfolioItems
                    .filter(item => item.assetType === type)
                    .reduce((sum, item) => sum + item.currentValue, 0);
                  
                  const percentage = totalValue > 0 ? (typeTotal / totalValue) * 100 : 0;
                  
                  if (percentage === 0) return null;
                  
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{type}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentage} className="h-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="w-full md:w-auto">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              {assetTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value-desc">Value (High to Low)</SelectItem>
              <SelectItem value="value-asc">Value (Low to High)</SelectItem>
              <SelectItem value="name-asc">Name (A to Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z to A)</SelectItem>
              <SelectItem value="gain-desc">Gains (High to Low)</SelectItem>
              <SelectItem value="gain-asc">Gains (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BarChart2 className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No assets found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? "You don't have any assets in your portfolio yet." 
              : `You don't have any ${filter} assets in your portfolio.`}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 bg-finance-primary hover:bg-finance-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              {/* Dialog content - reused from above */}
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAndSortedItems.map((item) => {
            const initialValue = item.purchasePrice * item.quantity;
            const currentValue = item.currentValue;
            const gain = currentValue - initialValue;
            const gainPercentage = (gain / initialValue) * 100;
            const performanceData = generatePerformanceData(item);
            
            return (
              <Card key={item.id} className="shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <Tabs defaultValue="overview">
                    <div className="flex justify-between items-start p-4 border-b">
                      <div>
                        <h3 className="font-medium text-lg">{item.assetName}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {item.assetType}
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                          </span>
                        </div>
                      </div>
                      <TabsList className="p-1">
                        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                        <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="overview" className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Current Value</p>
                          <p className="text-lg font-semibold">
                            ${item.currentValue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${(item.currentValue / item.quantity).toFixed(2)} per unit
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Purchase Price</p>
                          <p className="text-lg font-semibold">
                            ${(item.purchasePrice * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${item.purchasePrice.toFixed(2)} per unit
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Total Gain/Loss</p>
                          <div className="flex items-center">
                            <span className={`text-lg font-semibold ${gain >= 0 ? 'text-finance-success' : 'text-finance-danger'}`}>
                              ${Math.abs(gain).toLocaleString()}
                            </span>
                            <div className={`ml-2 flex items-center ${gain >= 0 ? 'text-finance-success' : 'text-finance-danger'}`}>
                              {gain >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span className="ml-1 text-sm">
                                {Math.abs(gainPercentage).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="performance" className="p-4">
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={performanceData}>
                            <defs>
                              <linearGradient id={`colorValue-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#0F4C81" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="name" 
                              fontSize={10}
                              tickLine={false}
                            />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              fontSize={10}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#0F4C81" 
                              fillOpacity={1} 
                              fill={`url(#colorValue-${item.id})`} 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Portfolio;
