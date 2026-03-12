import { useEffect, useState } from 'react';
import { BarChart3, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { aiService } from '@/services/aiService';
import { PredictionCard } from '@/components/predictions/PredictionCard';
import type { Prediction } from '@/types';

const QUICK_CROPS = ['Maize', 'Cassava', 'Yam', 'Tomato', 'Plantain', 'Cocoa', 'Rice', 'Pepper', 'Onion', 'Groundnut'];

export function PredictionsPage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [cropInput, setCropInput] = useState('');
  const [error, setError] = useState('');

  const loadPredictions = async () => {
    if (!user) return;
    const data = await aiService.getUserPredictions(user.id);
    setPredictions(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadPredictions(); }, [user]);

  const handlePredict = async () => {
    if (!user || !cropInput.trim()) return;
    setError('');
    setPredicting(true);
    try {
      await aiService.predictDemand(user.id, cropInput.trim());
      setCropInput('');
      await loadPredictions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title mb-1">AI Demand Predictions</h1>
        <p className="text-blue-400 text-sm">Get AI-powered demand forecasts for any crop in Ghana's markets</p>
      </div>

      {/* Prediction form */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="font-display font-bold text-blue-900">Run New Prediction</h2>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3 mb-3">
          <input
            className="input-field flex-1"
            placeholder="Enter crop name (e.g. Maize, Tomato...)"
            value={cropInput}
            onChange={e => setCropInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePredict()}
          />
          <button
            onClick={handlePredict}
            disabled={predicting || !cropInput.trim()}
            className="btn-primary whitespace-nowrap"
          >
            {predicting ? <><div className="spinner" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Predict</>}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_CROPS.map(crop => (
            <button
              key={crop}
              onClick={() => setCropInput(crop)}
              className={`text-xs px-3 py-1 rounded-full border font-medium transition-all duration-150 ${
                cropInput === crop
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'border-blue-200 text-blue-500 hover:border-blue-400 hover:text-blue-700 bg-white'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>

        {predicting && (
          <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="spinner" />
            <div>
              <p className="text-sm font-display font-bold text-blue-900">AI is analyzing market data...</p>
              <p className="text-xs text-blue-400 mt-0.5">Evaluating demand trends for <span className="font-semibold">{cropInput}</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Demand score guide */}
      <div className="card">
        <h3 className="font-display font-bold text-blue-400 text-xs uppercase tracking-widest mb-3">Demand Score Guide</h3>
        <div className="flex gap-6">
          {[
            { range: '70–100', label: 'High Demand', color: 'text-emerald-600', dot: 'bg-emerald-400' },
            { range: '40–69',  label: 'Moderate',    color: 'text-amber-500',   dot: 'bg-amber-400' },
            { range: '0–39',   label: 'Low Demand',  color: 'text-red-500',     dot: 'bg-red-400' },
          ].map(({ range, label, color, dot }) => (
            <div key={range} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className={`text-xs font-mono font-bold ${color}`}>{range}</span>
              <span className="text-xs text-blue-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Past predictions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <h2 className="section-title">Prediction History</h2>
          <span className="badge-soil">{predictions.length}</span>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1].map(i => <div key={i} className="card h-40 animate-pulse-slow bg-blue-50" />)}
          </div>
        ) : predictions.length === 0 ? (
          <div className="card text-center py-12 border-dashed">
            <BarChart3 className="w-8 h-8 text-blue-200 mx-auto mb-2" />
            <p className="text-blue-400 text-sm">No predictions yet</p>
            <p className="text-blue-300 text-xs mt-1">Enter a crop name above to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {predictions.map(p => <PredictionCard key={p.id} prediction={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
