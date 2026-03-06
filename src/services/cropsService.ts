import { supabase, TABLES } from '@/lib/supabase';
import type { Crop } from '@/types';

export interface CreateCropData {
  crop_name: string;
  quantity: number;
  location: string;
  harvest_date: string;
  expected_price: number;
}

export const cropsService = {
  async getUserCrops(userId: string): Promise<Crop[]> {
    const { data, error } = await supabase
      .from(TABLES.CROPS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Crop[];
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
    return data as Crop;
  },

  async updateCropStatus(cropId: string, status: Crop['status']): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CROPS)
      .update({ status })
      .eq('id', cropId);

    if (error) throw error;
  },

  async deleteCrop(cropId: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CROPS)
      .delete()
      .eq('id', cropId);

    if (error) throw error;
  },

  async getDashboardStats(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.CROPS)
      .select('status')
      .eq('user_id', userId);

    if (error) throw error;

    const total = data.length;
    const active = data.filter(c => c.status === 'available').length;
    return { total, active };
  },
};
