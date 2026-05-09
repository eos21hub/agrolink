import { supabase, TABLES } from '@/lib/supabase';
import { cache } from '@/lib/cache';
import type { MarketPrice } from '@/types';

const TTL = 5 * 60 * 1000; // 5 min

export const marketService = {
  async getAllPrices(forceRefresh = false): Promise<MarketPrice[]> {
    const key = 'market:all';
    if (!forceRefresh) {
      const cached = cache.get<MarketPrice[]>(key);
      if (cached) return cached;
    }

    const { data, error } = await supabase
      .from(TABLES.MARKET_PRICES)
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    const result = data as MarketPrice[];
    cache.set(key, result, TTL);
    return result;
  },

  async getPricesByCrop(cropName: string): Promise<MarketPrice[]> {
    const key = `market:crop:${cropName.toLowerCase()}`;
    const cached = cache.get<MarketPrice[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from(TABLES.MARKET_PRICES)
      .select('*')
      .ilike('crop', `%${cropName}%`)
      .order('price_per_kg', { ascending: false });

    if (error) throw error;
    const result = data as MarketPrice[];
    cache.set(key, result, TTL);
    return result;
  },

  async getLatestPrices(limit = 5): Promise<MarketPrice[]> {
    const key = `market:latest:${limit}`;
    const cached = cache.get<MarketPrice[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from(TABLES.MARKET_PRICES)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    const result = data as MarketPrice[];
    cache.set(key, result, TTL);
    return result;
  },
};
