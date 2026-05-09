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
  // Extended fields
  uv_index?: number;
  pressure?: number;         // hPa
  visibility?: number;       // km
  cloud_coverage?: number;   // %
  dew_point?: number;
  season?: string;
  sunrise?: string;
  sunset?: string;
  alerts?: WeatherAlert[];
}

export interface WeatherAlert {
  type: 'heat_stress' | 'heavy_rain' | 'strong_wind' | 'drought_risk' | 'flood_risk' | 'harmattan';
  severity: 'low' | 'medium' | 'high';
  message: string;
  farming_impact: string;
}

export interface WeatherForecastDay {
  date: string;             // ISO date
  day_name: string;
  high: number;
  low: number;
  humidity: number;
  rainfall_probability: number;
  wind_speed: number;
  description: string;
  icon: string;
  farming_note: string;
}

export interface HourlyForecast {
  time: string;             // e.g. "06:00"
  temperature: number;
  rainfall_probability: number;
  description: string;
  icon: string;
  wind_speed: number;
}

export interface AgriculturalConditions {
  location: string;
  soil_moisture: 'dry' | 'adequate' | 'wet' | 'waterlogged';
  soil_moisture_percent: number;
  evapotranspiration_mm: number;   // mm/day
  growing_degree_days: number;     // base 10°C
  frost_risk: boolean;
  irrigation_recommendation: string;
  spray_window: 'favorable' | 'marginal' | 'unfavorable';
  spray_note: string;
}

export interface AIResponse {
  demand_score: number;
  predicted_price: number;
  best_market: string;
  reasoning: string;
  // Extended fields
  confidence?: number;
  price_range?: { low: number; high: number };
  market_alternatives?: string[];
  seasonal_trend?: 'rising' | 'stable' | 'falling';
  risk_level?: 'low' | 'medium' | 'high';
  tips?: string[];
  best_sell_window?: string;
}

export interface PriceTrendPoint {
  date: string;
  price: number;
  market: string;
  is_forecast?: boolean;
}

export interface PriceTrend {
  crop: string;
  currency: string;
  unit: string;
  history: PriceTrendPoint[];   // last 30 days
  forecast: PriceTrendPoint[];  // next 7 days
  trend_direction: 'rising' | 'stable' | 'falling';
  avg_30d: number;
  volatility: 'low' | 'medium' | 'high';
  analyst_note: string;
}

export interface MarketReport {
  market: string;
  region: string;
  report_date: string;
  activity_level: 'low' | 'moderate' | 'high' | 'very high';
  top_commodities: { crop: string; avg_price: number; demand: 'low' | 'moderate' | 'high' }[];
  buyer_presence: number;       // 0-100
  road_access: 'poor' | 'fair' | 'good' | 'excellent';
  market_days: string[];
  transport_options: string[];
  notes: string;
}

export interface PestAlert {
  crop: string;
  region: string;
  pest_name: string;
  pest_type: 'insect' | 'fungal' | 'bacterial' | 'viral' | 'weed';
  severity: 'watch' | 'warning' | 'emergency';
  affected_stage: string;
  symptoms: string;
  recommended_action: string;
  organic_option?: string;
  reported_date: string;
}

export interface CropCalendarEntry {
  crop: string;
  phase: 'pre_season' | 'planting' | 'growing' | 'flowering' | 'harvesting' | 'post_harvest';
  recommended: boolean;
  start_month: number;
  end_month: number;
  notes: string;
  varieties?: string[];
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
