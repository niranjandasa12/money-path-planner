
import { supabase } from "@/integrations/supabase/client";
import { Goal } from "@/types";

// Helper function to convert from snake_case to camelCase
const mapGoalFromDB = (dbGoal: any): Goal => ({
  id: dbGoal.id,
  userId: dbGoal.user_id,
  name: dbGoal.name,
  targetAmount: dbGoal.target_amount,
  currentAmount: dbGoal.current_amount,
  deadline: dbGoal.deadline,
  createdAt: dbGoal.created_at
});

// Helper function to convert from camelCase to snake_case for inserts and updates
const mapGoalToDB = (goal: Partial<Goal>) => ({
  name: goal.name,
  target_amount: goal.targetAmount,
  current_amount: goal.currentAmount,
  deadline: goal.deadline,
  user_id: goal.userId
});

export const goalService = {
  async getGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapGoalFromDB) as Goal[];
  },

  async addGoal(goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('goals')
      .insert([mapGoalToDB(goal)])
      .select()
      .single();

    if (error) throw error;
    return mapGoalFromDB(data) as Goal;
  },

  async updateGoal(id: number, updates: Partial<Goal>) {
    const { data, error } = await supabase
      .from('goals')
      .update(mapGoalToDB(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapGoalFromDB(data) as Goal;
  },

  async deleteGoal(id: number) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
