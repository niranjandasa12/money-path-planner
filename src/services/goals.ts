
import { supabase } from "@/integrations/supabase/client";
import { Goal } from "@/types";

// Types to match the database schema
type DbGoal = {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  created_at: string;
};

// Conversion functions
const mapToGoal = (dbGoal: DbGoal): Goal => ({
  id: dbGoal.id,
  userId: dbGoal.user_id,
  name: dbGoal.name,
  targetAmount: dbGoal.target_amount,
  currentAmount: dbGoal.current_amount,
  deadline: dbGoal.deadline,
  createdAt: dbGoal.created_at
});

const mapToDbGoal = (goal: Omit<Goal, "id" | "userId" | "createdAt">): Omit<DbGoal, "id" | "user_id" | "created_at"> => ({
  name: goal.name,
  target_amount: goal.targetAmount,
  current_amount: goal.currentAmount,
  deadline: goal.deadline
});

export const goalService = {
  async getGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as DbGoal[]).map(mapToGoal);
  },

  async addGoal(goal: Omit<Goal, "id" | "userId" | "createdAt">) {
    const { data, error } = await supabase
      .from('goals')
      .insert([mapToDbGoal(goal)])
      .select()
      .single();

    if (error) throw error;
    return mapToGoal(data as DbGoal);
  },

  async updateGoal(id: number, updates: Partial<Goal>) {
    // Convert camelCase to snake_case for the database
    const dbUpdates: Partial<DbGoal> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
    if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;

    const { data, error } = await supabase
      .from('goals')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapToGoal(data as DbGoal);
  },

  async deleteGoal(id: number) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
