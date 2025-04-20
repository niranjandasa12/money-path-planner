
import { supabase } from "@/integrations/supabase/client";
import { PortfolioItem, AssetType } from "@/types";

// Types to match the database schema
type DbPortfolioItem = {
  id: number;
  user_id: number | null;
  asset_name: string;
  asset_type: string;
  quantity: number;
  purchase_price: number;
  current_value: number;
  created_at: string | null;
};

// Conversion functions
const mapToPortfolioItem = (dbItem: DbPortfolioItem): PortfolioItem => ({
  id: dbItem.id,
  userId: dbItem.user_id || 1, // Default to user 1 if null
  assetName: dbItem.asset_name,
  assetType: dbItem.asset_type as AssetType,
  quantity: dbItem.quantity,
  purchasePrice: dbItem.purchase_price,
  currentValue: dbItem.current_value,
  createdAt: dbItem.created_at || new Date().toISOString()
});

const mapToDbPortfolioItem = (item: Omit<PortfolioItem, "id" | "userId" | "createdAt">): Omit<DbPortfolioItem, "id" | "user_id" | "created_at"> => ({
  asset_name: item.assetName,
  asset_type: item.assetType,
  quantity: item.quantity,
  purchase_price: item.purchasePrice,
  current_value: item.currentValue
});

export const portfolioService = {
  async getPortfolioItems() {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as DbPortfolioItem[]).map(mapToPortfolioItem);
  },

  async getPortfolioSummary() {
    // Get portfolio items
    const items = await this.getPortfolioItems();

    // Calculate totals
    const totalValue = items.reduce((sum, item) => sum + item.currentValue, 0);
    const totalInvested = items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
    const profit = totalValue - totalInvested;
    const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    // Group by asset type
    const assetAllocation = items.reduce((allocation, item) => {
      const type = item.assetType;
      if (!allocation[type]) {
        allocation[type] = 0;
      }
      allocation[type] += item.currentValue;
      return allocation;
    }, {} as Record<string, number>);

    // Return summary
    return {
      totalValue,
      totalInvested,
      profit,
      profitPercentage,
      assetAllocation,
      totalAssets: items.length
    };
  },

  async addPortfolioItem(item: Omit<PortfolioItem, "id" | "userId" | "createdAt">) {
    const { data, error } = await supabase
      .from('portfolios')
      .insert([mapToDbPortfolioItem(item)])
      .select()
      .single();

    if (error) throw error;
    return mapToPortfolioItem(data as DbPortfolioItem);
  },

  async updatePortfolioItem(id: number, updates: Partial<PortfolioItem>) {
    // Convert camelCase to snake_case for the database
    const dbUpdates: Partial<DbPortfolioItem> = {};
    
    if (updates.assetName !== undefined) dbUpdates.asset_name = updates.assetName;
    if (updates.assetType !== undefined) dbUpdates.asset_type = updates.assetType;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
    if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;

    const { data, error } = await supabase
      .from('portfolios')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapToPortfolioItem(data as DbPortfolioItem);
  },

  async deletePortfolioItem(id: number) {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
