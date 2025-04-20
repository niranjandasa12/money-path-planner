import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { goalService } from '@/services/api';
import { Goal } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Target, Calendar, Trash2, Edit, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService as supabaseGoalService } from '@/services/goals';

const Goals = () => {
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: new Date().toISOString().split('T')[0]
  });
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Query goals data
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: supabaseGoalService.getGoals
  });

  // Mutations
  const addGoalMutation = useMutation({
    mutationFn: supabaseGoalService.addGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setNewGoal({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: new Date().toISOString().split('T')[0]
      });
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: Partial<Goal> }) => 
      supabaseGoalService.updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setEditingGoal(null);
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: supabaseGoalService.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  // Form handling
  const validateForm = (goal: Partial<Goal>) => {
    const newErrors: Record<string, string> = {};
    
    if (!goal.name) {
      newErrors.name = 'Goal name is required';
    }
    
    if (!goal.targetAmount || goal.targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }
    
    if (goal.currentAmount === undefined || goal.currentAmount < 0) {
      newErrors.currentAmount = 'Current amount must be 0 or positive';
    }
    
    if (!goal.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(goal.deadline);
      const today = new Date();
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGoal = async () => {
    if (!validateForm(newGoal)) {
      return;
    }

    try {
      await addGoalMutation.mutateAsync(newGoal as Omit<Goal, 'id' | 'userId' | 'createdAt'>);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !validateForm(editingGoal)) {
      return;
    }

    try {
      await updateGoalMutation.mutateAsync({
        id: editingGoal.id,
        updates: editingGoal
      });
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await deleteGoalMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleInputChange = (field: keyof typeof newGoal, value: any) => {
    setNewGoal(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleEditInputChange = (field: keyof Goal, value: any) => {
    if (editingGoal) {
      setEditingGoal({
        ...editingGoal,
        [field]: value
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <p>Loading goals data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Goals</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-finance-primary hover:bg-finance-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Financial Goal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  value={newGoal.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="e.g., Retirement Fund, House Down Payment"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={newGoal.targetAmount === 0 ? '' : newGoal.targetAmount}
                  onChange={(e) => handleInputChange('targetAmount', parseFloat(e.target.value) || 0)}
                  className={errors.targetAmount ? 'border-red-500' : ''}
                  placeholder="e.g., 10000"
                />
                {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount}</p>}
              </div>
              
              <div>
                <Label htmlFor="currentAmount">Current Amount ($)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  value={newGoal.currentAmount === 0 ? '0' : newGoal.currentAmount}
                  onChange={(e) => handleInputChange('currentAmount', parseFloat(e.target.value) || 0)}
                  className={errors.currentAmount ? 'border-red-500' : ''}
                  placeholder="e.g., 2500"
                />
                {errors.currentAmount && <p className="text-red-500 text-xs mt-1">{errors.currentAmount}</p>}
              </div>
              
              <div>
                <Label htmlFor="deadline">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className={errors.deadline ? 'border-red-500' : ''}
                />
                {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddGoal} className="bg-finance-primary hover:bg-finance-primary/90">
                Add Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {goals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Target className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No goals found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Set financial goals to help track your progress.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 bg-finance-primary hover:bg-finance-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Set Your First Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Financial Goal</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    value={newGoal.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="e.g., Retirement Fund, House Down Payment"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="targetAmount">Target Amount ($)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={newGoal.targetAmount === 0 ? '' : newGoal.targetAmount}
                    onChange={(e) => handleInputChange('targetAmount', parseFloat(e.target.value) || 0)}
                    className={errors.targetAmount ? 'border-red-500' : ''}
                    placeholder="e.g., 10000"
                  />
                  {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount}</p>}
                </div>
                
                <div>
                  <Label htmlFor="currentAmount">Current Amount ($)</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    value={newGoal.currentAmount === 0 ? '0' : newGoal.currentAmount}
                    onChange={(e) => handleInputChange('currentAmount', parseFloat(e.target.value) || 0)}
                    className={errors.currentAmount ? 'border-red-500' : ''}
                    placeholder="e.g., 2500"
                  />
                  {errors.currentAmount && <p className="text-red-500 text-xs mt-1">{errors.currentAmount}</p>}
                </div>
                
                <div>
                  <Label htmlFor="deadline">Target Date</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className={errors.deadline ? 'border-red-500' : ''}
                  />
                  {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddGoal} className="bg-finance-primary hover:bg-finance-primary/90">
                  Add Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            const deadlineDate = new Date(goal.deadline);
            const today = new Date();
            const timeRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = timeRemaining < 0;
            
            return (
              <Card key={goal.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">{goal.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingGoal(goal)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Goal</DialogTitle>
                          </DialogHeader>
                          {editingGoal && (
                            <div className="grid gap-4 py-4">
                              <div>
                                <Label htmlFor="edit-name">Goal Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editingGoal.name}
                                  onChange={(e) => handleEditInputChange('name', e.target.value)}
                                  className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-targetAmount">Target Amount ($)</Label>
                                <Input
                                  id="edit-targetAmount"
                                  type="number"
                                  value={editingGoal.targetAmount}
                                  onChange={(e) => handleEditInputChange('targetAmount', parseFloat(e.target.value) || 0)}
                                  className={errors.targetAmount ? 'border-red-500' : ''}
                                />
                                {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount}</p>}
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-currentAmount">Current Amount ($)</Label>
                                <Input
                                  id="edit-currentAmount"
                                  type="number"
                                  value={editingGoal.currentAmount}
                                  onChange={(e) => handleEditInputChange('currentAmount', parseFloat(e.target.value) || 0)}
                                  className={errors.currentAmount ? 'border-red-500' : ''}
                                />
                                {errors.currentAmount && <p className="text-red-500 text-xs mt-1">{errors.currentAmount}</p>}
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-deadline">Target Date</Label>
                                <Input
                                  id="edit-deadline"
                                  type="date"
                                  value={new Date(editingGoal.deadline).toISOString().split('T')[0]}
                                  onChange={(e) => handleEditInputChange('deadline', e.target.value)}
                                  className={errors.deadline ? 'border-red-500' : ''}
                                />
                                {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleUpdateGoal} className="bg-finance-primary hover:bg-finance-primary/90">
                              Update Goal
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
                              This will permanently delete this goal. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="bg-finance-danger hover:bg-finance-danger/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-xs text-gray-500">Saved</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">${goal.currentAmount.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-xs text-gray-500">Target</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">${goal.targetAmount.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-xs text-gray-500">Remaining</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">${remaining.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-xs text-gray-500">Deadline</span>
                        </div>
                        <p className={`text-sm font-semibold mt-1 ${isOverdue ? 'text-finance-danger' : ''}`}>
                          {format(deadlineDate, 'MMM d, yyyy')}
                          <span className="block text-xs mt-0.5">
                            {isOverdue 
                              ? `${Math.abs(timeRemaining)} days overdue` 
                              : `${timeRemaining} days left`}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Goals;
