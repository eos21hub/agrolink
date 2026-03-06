import { TrendingUp, Store, DollarSign, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import type { Prediction } from '@/types';

interface PredictionCardProps {
  prediction: Prediction;
}

function DemandGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#52c152' : score >= 40 ? '#facc15' : '#f87171';
  const label = score >= 70 ? 'High Demand' : score >= 40 ? 'Moderate' : 'Low Demand';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(45,168,45,0.1)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="14" fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${(score / 100) * 88} 88`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold text-sm" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-display font-medium mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  return (
    <div className="card animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-earth-100 capitalize text-base">{prediction.crop_name}</h3>
          <p className="text-xs text-earth-600 mt-0.5">
            {format(new Date(prediction.created_at), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
        <DemandGauge score={prediction.demand_score} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-forest-900/20 rounded-lg p-3 border border-forest-800/20">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-savanna-500" />
            <span className="text-xs text-earth-500">Predicted Price</span>
          </div>
          <div className="font-mono font-bold text-savanna-300">GHS {prediction.predicted_price}/kg</div>
        </div>
        <div className="bg-forest-900/20 rounded-lg p-3 border border-forest-800/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Store className="w-3.5 h-3.5 text-forest-500" />
            <span className="text-xs text-earth-500">Best Market</span>
          </div>
          <div className="font-display font-semibold text-forest-300 text-sm">{prediction.best_market}</div>
        </div>
      </div>

      {prediction.reasoning && (
        <p className="text-xs text-earth-500 leading-relaxed border-t border-forest-900/20 pt-3">
          {prediction.reasoning}
        </p>
      )}
    </div>
  );
}
