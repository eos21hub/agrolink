import { supabase, TABLES } from '@/lib/supabase';
import { cache } from '@/lib/cache';
import type { Crop } from '@/types';

const TTL = 30 * 1000; // 30s

export interface CreateCropData {
  crop_name: string;
  quantity: number;
  location: string;
  harvest_date: string;
  expected_price: number;
}

export const cropsService = {
  async getUserCrops(userId: string): Promise<Crop[]> {
    const key = `crops:${userId}`;
    const cached = cache.get<Crop[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from(TABLES.CROPS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const result = data as Crop[];
    cache.set(key, result, TTL);
    return result;
  },

  async createCrop(userId: string, cropData: CreateCropData): Promise<Crop> {
    const { data, error } = await supabase
      .from(TABLES.CROPS)
      .insert({
        user_id: userId,
        ...cropData,
        status: 'available',
      })
      .select()
      .single();

    if (error) throw error;
    cache.invalidate(`crops:${userId}`);
    return data as Crop;
  },

  async updateCropStatus(cropId: string, status: Crop['status'], userId?: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CROPS)
      .update({ status })
      .eq('id', cropId);

    if (error) throw error;
    if (userId) cache.invalidate(`crops:${userId}`);
  },

  async deleteCrop(cropId: string, userId?: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CROPS)
      .delete()
      .eq('id', cropId);

    if (error) throw error;
    if (userId) cache.invalidate(`crops:${userId}`);
  },

  async getDashboardStats(userId: string) {
    const crops = await this.getUserCrops(userId);
    return {
      total: crops.length,
      active: crops.filter(c => c.status === 'available').length,
    };
  },
};
