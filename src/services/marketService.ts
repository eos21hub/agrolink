import { supabase, TABLES } from '@/lib/supabase';
import type { MarketPrice } from '@/types';

export const marketService = {
  async getAllPrices(): Promise<MarketPrice[]> {
    const { data, error } = await supabase
      .from(TABLES.MARKET_PRICES)
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as MarketPrice[];
  },

  async getPricesByCrop(cropName: string): Promise<MarketPrice[]> {
    const { data, error } = await supabase
      .from(TABLES.MARKET_PRICES)
      .select('*')
      .ilike('crop', `%${cropName}%`)
      .order('price_per_kg', { ascending: false });

    if (error) throw error;
    return data as MarketPrice[];
  },

  async getLatestPrices(limit = 5): Promise<MarketPrice[]> {
    const { data, error } = await supabase
      .from(TABLES.MARKET_PRICES)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as MarketPrice[];
  },
};
