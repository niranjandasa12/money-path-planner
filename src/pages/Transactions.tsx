import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { portfolioService } from '@/services/api';
import { transactionService as supabaseTransactionService } from '@/services/transactions';
import { Transaction, TransactionType, PortfolioItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Wallet, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const Transactions = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    date: new Date().toISOString(),
    type: 'Buy',
    assetName: '',
    quantity: 0,
    price: 0,
    notes: ''
  });
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: supabaseTransactionService.getTransactions
  });

  const { data: portfolioItems = [], isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ['portfolioItems'],
    queryFn: portfolioService.getPortfolioItems
  });

  const addTransactionMutation = useMutation({
    mutationFn: supabaseTransactionService.addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioItems'] });
      setNewTransaction({
        date: new Date().toISOString(),
        type: 'Buy',
        assetName: '',
        quantity: 0,
        price: 0,
        notes: ''
      });
      toast.success('Transaction added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding transaction:', error);
      toast.error(`Failed to add transaction: ${error.message || 'Unknown error'}`);
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: Partial<Transaction> }) => 
      supabaseTransactionService.updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioItems'] });
      setEditingTransaction(null);
      toast.success('Transaction updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating transaction:', error);
      toast.error(`Failed to update transaction: ${error.message || 'Unknown error'}`);
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: supabaseTransactionService.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioItems'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting transaction:', error);
      toast.error(`Failed to delete transaction: ${error.message || 'Unknown error'}`);
    }
  });

  const filteredTransactions = transactions.filter(transaction => 
    filter === 'all' || transaction.type === filter
  );

  const validateForm = (transaction: Partial<Transaction>) => {
    const newErrors: Record<string, string> = {};
    
    if (!transaction.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!transaction.type) {
      newErrors.type = 'Transaction type is required';
    }
    
    if ((transaction.type === 'Buy' || transaction.type === 'Sell') && !transaction.assetName) {
      newErrors.assetName = 'Asset name is required for Buy/Sell transactions';
    }
    
    if ((transaction.type === 'Buy' || transaction.type === 'Sell') && 
        (!transaction.quantity || transaction.quantity <= 0)) {
      newErrors.quantity = 'Quantity must be greater than 0 for Buy/Sell transactions';
    }
    
    if (!transaction.price || transaction.price <= 0) {
      newErrors.price = 'Price/Amount must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTransaction = async () => {
    if (!validateForm(newTransaction)) {
      return;
    }
    
    try {
      await addTransactionMutation.mutateAsync(newTransaction as Omit<Transaction, "id" | "userId">);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction || !validateForm(editingTransaction)) {
      return;
    }
    
    try {
      await updateTransactionMutation.mutateAsync({
        id: editingTransaction.id,
        updates: editingTransaction
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransactionMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleInputChange = (field: keyof typeof newTransaction, value: any) => {
    setNewTransaction(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field: keyof Transaction, value: any) => {
    if (editingTransaction) {
      setEditingTransaction({
        ...editingTransaction,
        [field]: value
      });
    }
  };

  const handleNewTransactionTypeChange = (type: TransactionType) => {
    setNewTransaction(prev => {
      const updated = { ...prev, type };
      if (type === 'Deposit' || type === 'Withdraw') {
        updated.assetName = undefined;
        updated.quantity = undefined;
      }
      return updated;
    });
  };

  const handleEditTransactionTypeChange = (type: TransactionType) => {
    if (editingTransaction) {
      const updated = { ...editingTransaction, type };
      if (type === 'Deposit' || type === 'Withdraw') {
        updated.assetName = undefined;
        updated.quantity = undefined;
      }
      setEditingTransaction(updated);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  if (isLoadingTransactions || isLoadingPortfolio) {
    return (
      <DashboardLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <p>Loading transactions data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const transactionTypes: TransactionType[] = ['Buy', 'Sell', 'Deposit', 'Withdraw'];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-finance-primary hover:bg-finance-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={newTransaction.date ? new Date(newTransaction.date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('date', new Date(e.target.value).toISOString())}
                    className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
                
                <div>
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) => handleNewTransactionTypeChange(value as TransactionType)}
                  >
                    <SelectTrigger id="type" className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                </div>
              </div>
              
              {(newTransaction.type === 'Buy' || newTransaction.type === 'Sell') && (
                <>
                  <div>
                    <Label htmlFor="assetName">Asset Name</Label>
                    <Select
                      value={newTransaction.assetName}
                      onValueChange={(value) => handleInputChange('assetName', value)}
                    >
                      <SelectTrigger id="assetName" className={errors.assetName ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {portfolioItems.map((item) => (
                          <SelectItem key={item.id} value={item.assetName}>{item.assetName}</SelectItem>
                        ))}
                        <SelectItem value="other">Other (New Asset)</SelectItem>
                      </SelectContent>
                    </Select>
                    {newTransaction.assetName === 'other' && (
                      <Input
                        className="mt-2"
                        placeholder="Enter asset name"
                        onChange={(e) => handleInputChange('assetName', e.target.value)}
                      />
                    )}
                    {errors.assetName && <p className="text-red-500 text-xs mt-1">{errors.assetName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newTransaction.quantity === 0 ? '' : newTransaction.quantity}
                      onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                      className={errors.quantity ? 'border-red-500' : ''}
                    />
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="price">
                  {newTransaction.type === 'Buy' || newTransaction.type === 'Sell' 
                    ? 'Price per Unit ($)' 
                    : 'Amount ($)'}
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={newTransaction.price === 0 ? '' : newTransaction.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newTransaction.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddTransaction} className="bg-finance-primary hover:bg-finance-primary/90">
                Add Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full md:w-auto">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredTransactions.length} transactions found
            </div>
          </div>
        </CardContent>
      </Card>
      
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Wallet className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? "You don't have any transactions yet." 
              : `You don't have any ${filter} transactions.`}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 bg-finance-primary hover:bg-finance-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={newTransaction.date ? new Date(newTransaction.date).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleInputChange('date', new Date(e.target.value).toISOString())}
                      className={errors.date ? 'border-red-500' : ''}
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Transaction Type</Label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value) => handleNewTransactionTypeChange(value as TransactionType)}
                    >
                      <SelectTrigger id="type" className={errors.type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {transactionTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                  </div>
                </div>
                
                {(newTransaction.type === 'Buy' || newTransaction.type === 'Sell') && (
                  <>
                    <div>
                      <Label htmlFor="assetName">Asset Name</Label>
                      <Select
                        value={newTransaction.assetName}
                        onValueChange={(value) => handleInputChange('assetName', value)}
                      >
                        <SelectTrigger id="assetName" className={errors.assetName ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                          {portfolioItems.map((item) => (
                            <SelectItem key={item.id} value={item.assetName}>{item.assetName}</SelectItem>
                          ))}
                          <SelectItem value="other">Other (New Asset)</SelectItem>
                        </SelectContent>
                      </Select>
                      {newTransaction.assetName === 'other' && (
                        <Input
                          className="mt-2"
                          placeholder="Enter asset name"
                          onChange={(e) => handleInputChange('assetName', e.target.value)}
                        />
                      )}
                      {errors.assetName && <p className="text-red-500 text-xs mt-1">{errors.assetName}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newTransaction.quantity === 0 ? '' : newTransaction.quantity}
                        onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                        className={errors.quantity ? 'border-red-500' : ''}
                      />
                      {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                    </div>
                  </>
                )}
                
                <div>
                  <Label htmlFor="price">
                    {newTransaction.type === 'Buy' || newTransaction.type === 'Sell' 
                      ? 'Price per Unit ($)' 
                      : 'Amount ($)'}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={newTransaction.price === 0 ? '' : newTransaction.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newTransaction.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddTransaction} className="bg-finance-primary hover:bg-finance-primary/90">
                  Add Transaction
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(transaction.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'Buy' ? 'bg-green-100 text-green-800' : 
                          transaction.type === 'Sell' ? 'bg-red-100 text-red-800' : 
                          transaction.type === 'Deposit' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.assetName || '-'}</TableCell>
                      <TableCell>{transaction.quantity || '-'}</TableCell>
                      <TableCell>${transaction.price?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        {transaction.quantity 
                          ? `$${(transaction.price * transaction.quantity).toLocaleString()}`
                          : `$${transaction.price?.toLocaleString() || 0}`
                        }
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {transaction.notes || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingTransaction(transaction)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Edit Transaction</DialogTitle>
                              </DialogHeader>
                              {editingTransaction && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="edit-date">Date</Label>
                                      <Input
                                        id="edit-date"
                                        type="datetime-local"
                                        value={new Date(editingTransaction.date).toISOString().slice(0, 16)}
                                        onChange={(e) => handleEditInputChange('date', new Date(e.target.value).toISOString())}
                                        className={errors.date ? 'border-red-500' : ''}
                                      />
                                      {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor="edit-type">Transaction Type</Label>
                                      <Select
                                        value={editingTransaction.type}
                                        onValueChange={(value) => handleEditTransactionTypeChange(value as TransactionType)}
                                      >
                                        <SelectTrigger id="edit-type" className={errors.type ? 'border-red-500' : ''}>
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {transactionTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                                    </div>
                                  </div>
                                  
                                  {(editingTransaction.type === 'Buy' || editingTransaction.type === 'Sell') && (
                                    <>
                                      <div>
                                        <Label htmlFor="edit-assetName">Asset Name</Label>
                                        <Select
                                          value={editingTransaction.assetName}
                                          onValueChange={(value) => handleEditInputChange('assetName', value)}
                                        >
                                          <SelectTrigger id="edit-assetName" className={errors.assetName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select asset" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {portfolioItems.map((item) => (
                                              <SelectItem key={item.id} value={item.assetName}>{item.assetName}</SelectItem>
                                            ))}
                                            <SelectItem value="other">Other (New Asset)</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        {editingTransaction.assetName === 'other' && (
                                          <Input
                                            className="mt-2"
                                            placeholder="Enter asset name"
                                            onChange={(e) => handleEditInputChange('assetName', e.target.value)}
                                          />
                                        )}
                                        {errors.assetName && <p className="text-red-500 text-xs mt-1">{errors.assetName}</p>}
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="edit-quantity">Quantity</Label>
                                        <Input
                                          id="edit-quantity"
                                          type="number"
                                          value={editingTransaction.quantity || ''}
                                          onChange={(e) => handleEditInputChange('quantity', parseFloat(e.target.value) || 0)}
                                          className={errors.quantity ? 'border-red-500' : ''}
                                        />
                                        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                                      </div>
                                    </>
                                  )}
                                  
                                  <div>
                                    <Label htmlFor="edit-price">
                                      {editingTransaction.type === 'Buy' || editingTransaction.type === 'Sell' 
                                        ? 'Price per Unit ($)' 
                                        : 'Amount ($)'}
                                    </Label>
                                    <Input
                                      id="edit-price"
                                      type="number"
                                      value={editingTransaction.price}
                                      onChange={(e) => handleEditInputChange('price', parseFloat(e.target.value) || 0)}
                                      className={errors.price ? 'border-red-500' : ''}
                                    />
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="edit-notes">Notes (Optional)</Label>
                                    <Textarea
                                      id="edit-notes"
                                      value={editingTransaction.notes || ''}
                                      onChange={(e) => handleEditInputChange('notes', e.target.value)}
                                      rows={3}
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleUpdateTransaction} className="bg-finance-primary hover:bg-finance-primary/90">
                                  Update Transaction
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-finance-danger" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this transaction. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  className="bg-finance-danger hover:bg-finance-danger/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Transactions;
