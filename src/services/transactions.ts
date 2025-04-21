
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types";

// Types to match the database schema
type DbTransaction = {
  id: number;
  user_id: number | null;
  type: string;
  asset_name: string | null;
  quantity: number | null;
  price: number | null;
  date: string;
  notes: string | null;
};

// Conversion functions
const mapToTransaction = (dbTransaction: DbTransaction): Transaction => ({
  id: dbTransaction.id,
  userId: dbTransaction.user_id || 1, // Default to user 1 if null
  type: dbTransaction.type as any, // Cast to transaction type
  assetName: dbTransaction.asset_name || undefined,
  quantity: dbTransaction.quantity || undefined,
  price: dbTransaction.price || 0,
  date: dbTransaction.date,
  notes: dbTransaction.notes || undefined
});

const mapToDbTransaction = (transaction: Omit<Transaction, "id" | "userId">): Omit<DbTransaction, "id"> => ({
  user_id: 1, // Set default user ID to 1 - this fixes the null constraint error
  type: transaction.type,
  asset_name: transaction.assetName || null,
  quantity: transaction.quantity || null,
  price: transaction.price || null,
  date: transaction.date,
  notes: transaction.notes || null
});

export const transactionService = {
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data as DbTransaction[]).map(mapToTransaction);
  },

  async addTransaction(transaction: Omit<Transaction, "id" | "userId">) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([mapToDbTransaction(transaction)])
      .select()
      .single();

    if (error) throw error;
    return mapToTransaction(data as DbTransaction);
  },

  async updateTransaction(id: number, updates: Partial<Transaction>) {
    // Convert camelCase to snake_case for the database
    const dbUpdates: Partial<DbTransaction> = {};
    
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.assetName !== undefined) dbUpdates.asset_name = updates.assetName;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { data, error } = await supabase
      .from('transactions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapToTransaction(data as DbTransaction);
  },

  async deleteTransaction(id: number) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
