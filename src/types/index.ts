// ─── Database Types ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  region: string;
  role: 'farmer' | 'admin';
  created_at: string;
}

export interface Crop {
  id: string;
  user_id: string;
  crop_name: string;
  quantity: number; // kg
  location: string;
  harvest_date: string;
  expected_price: number; // GHS per kg
  status: 'available' | 'sold' | 'expired';
  created_at: string;
}

export interface MarketPrice {
  id: string;
  crop: string;
  market: string;
  price_per_kg: number;
  currency: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  crop_name: string;
  demand_score: number; // 0-100
  predicted_price: number;
  best_market: string;
  reasoning?: string;
  created_at: string;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  description: string;
  rainfall_probability: number;
  wind_speed: number;
  location: string;
  farming_advice: string;
  icon: string;
}

export interface AIResponse {
  demand_score: number;
  predicted_price: number;
  best_market: string;
  reasoning: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── UI State Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalCrops: number;
  activeCrops: number;
  totalPredictions: number;
  avgDemandScore: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  message: string;
  code?: string;
}
