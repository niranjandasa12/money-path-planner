
import { supabase } from "@/integrations/supabase/client";
import { Goal } from "@/types";

export const goalService = {
  async getGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Goal[];
  },

  async addGoal(goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('goals')
      .insert([goal])
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  },

  async updateGoal(id: number, updates: Partial<Goal>) {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  },

  async deleteGoal(id: number) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
