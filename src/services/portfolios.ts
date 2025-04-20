
import { supabase } from "@/integrations/supabase/client";
import { PortfolioItem, AssetType, PortfolioSummary } from "@/types";

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

  async getPortfolioSummary(): Promise<PortfolioSummary> {
    // Get portfolio items
    const items = await this.getPortfolioItems();

    // Calculate totals
    const totalValue = items.reduce((sum, item) => sum + item.currentValue, 0);
    const totalInvested = items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
    const totalGains = totalValue - totalInvested;
    const gainPercentage = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;

    // Group by asset type
    const assetTypeMap = new Map<string, number>();
    
    items.forEach(item => {
      const currentTypeValue = assetTypeMap.get(item.assetType) || 0;
      assetTypeMap.set(item.assetType, currentTypeValue + item.currentValue);
    });
    
    const assetDistribution = Array.from(assetTypeMap.entries()).map(([type, value]) => ({
      type,
      value,
      percentage: (value / totalValue) * 100
    }));

    // Return summary in the format expected by PortfolioSummary type
    return {
      totalValue,
      totalGains,
      gainPercentage,
      assetDistribution
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
