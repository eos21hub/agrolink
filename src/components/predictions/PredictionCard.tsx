import { DollarSign, Store } from 'lucide-react';
import { format } from 'date-fns';
import type { Prediction } from '@/types';

function DemandGauge({ score }: { score: number }) {
  const color  = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label  = score >= 70 ? 'High Demand' : score >= 40 ? 'Moderate' : 'Low Demand';
  const track  = score >= 70 ? 'rgba(16,185,129,0.15)' : score >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" stroke={track} strokeWidth="3" />
          <circle
            cx="18" cy="18" r="14" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${(score / 100) * 88} 88`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold text-sm" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-display font-semibold mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

export function PredictionCard({ prediction }: { prediction: Prediction }) {
  return (
    <div className="card animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-indigo-950 capitalize text-base">{prediction.crop_name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {format(new Date(prediction.created_at), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
        <DemandGauge score={prediction.demand_score} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-slate-500 font-medium">Predicted Price</span>
          </div>
          <div className="font-mono font-bold text-indigo-900">GHS {prediction.predicted_price}/kg</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Store className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-500 font-medium">Best Market</span>
          </div>
          <div className="font-display font-bold text-indigo-900 text-sm">{prediction.best_market}</div>
        </div>
      </div>

      {prediction.reasoning && (
        <p className="text-xs text-indigo-600 leading-relaxed border-t border-blue-100 pt-3">
          {prediction.reasoning}
        </p>
      )}
    </div>
  );
}
