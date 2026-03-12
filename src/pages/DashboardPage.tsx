import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wheat, TrendingUp, BarChart3, ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cropsService } from '@/services/cropsService';
import { marketService } from '@/services/marketService';
import { aiService } from '@/services/aiService';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { CropCard } from '@/components/crops/CropCard';
import type { Crop, MarketPrice, Prediction } from '@/types';

export function DashboardPage() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      cropsService.getUserCrops(user.id),
      marketService.getLatestPrices(5),
      aiService.getUserPredictions(user.id),
    ]).then(([c, p, pred]) => {
      setCrops(c);
      setPrices(p);
      setPredictions(pred ?? []);
    }).finally(() => setLoading(false));
  }, [user]);

  const activeCrops = crops.filter(c => c.status === 'available').length;
  const avgDemand = predictions.length
    ? Math.round(predictions.slice(0, 5).reduce((a, p) => a + p.demand_score, 0) / Math.min(predictions.length, 5))
    : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const STATS = [
    { label: 'Total Crops',      value: crops.length,                    icon: Wheat,     accent: 'bg-blue-100 text-blue-600' },
    { label: 'Active Listings',  value: activeCrops,                     icon: TrendingUp, accent: 'bg-emerald-100 text-emerald-600' },
    { label: 'Predictions Run',  value: predictions.length,              icon: BarChart3,  accent: 'bg-amber-100 text-amber-600' },
    { label: 'Avg Demand Score', value: avgDemand ? `${avgDemand}/100` : '—', icon: BarChart3, accent: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-blue-400 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="page-title">{user?.full_name?.split(' ')[0] || 'Farmer'}</h1>
          <p className="text-blue-400 text-sm mt-1">{user?.region}, Ghana</p>
        </div>
        <Link to="/upload-crop" className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Crop
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(({ label, value, icon: Icon, accent }, i) => (
          <div key={label} className="card animate-slide-up" style={{ animationDelay: `${i * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}>
            <div className={`w-9 h-9 rounded-xl ${accent} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="stat-value">{loading ? '—' : value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Recent crops */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Recent Crops</h2>
              <Link to="/upload-crop" className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 font-semibold transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map(i => <div key={i} className="card h-32 animate-pulse-slow bg-blue-50" />)}
              </div>
            ) : crops.length === 0 ? (
              <div className="card text-center py-8 border-dashed">
                <Wheat className="w-8 h-8 text-blue-200 mx-auto mb-2" />
                <p className="text-blue-400 text-sm">No crops uploaded yet</p>
                <Link to="/upload-crop" className="btn-primary inline-flex mt-3 text-xs py-2">Upload your first crop</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {crops.slice(0, 4).map(crop => <CropCard key={crop.id} crop={crop} />)}
              </div>
            )}
          </section>

          {/* Market prices */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Latest Market Prices</h2>
              <Link to="/market-prices" className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 font-semibold transition-colors">
                Full table <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-100 bg-blue-50">
                    <th className="px-4 py-3 text-left text-xs font-display font-bold text-blue-500 uppercase tracking-wider">Crop</th>
                    <th className="px-4 py-3 text-left text-xs font-display font-bold text-blue-500 uppercase tracking-wider">Market</th>
                    <th className="px-4 py-3 text-right text-xs font-display font-bold text-blue-500 uppercase tracking-wider">GHS/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-blue-300 text-xs">Loading...</td></tr>
                  ) : prices.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-blue-300 text-xs">No market data yet</td></tr>
                  ) : prices.map((p, i) => (
                    <tr key={p.id} className={`${i !== prices.length - 1 ? 'border-b border-blue-50' : ''} hover:bg-blue-50/60 transition-colors`}>
                      <td className="px-4 py-3 font-semibold text-blue-900 capitalize">{p.crop}</td>
                      <td className="px-4 py-3 text-blue-500">{p.market}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-blue-600">{p.price_per_kg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <h2 className="section-title">Weather</h2>
          <WeatherWidget location={user?.region ? `${user.region},GH` : 'Accra,GH'} />

          <div className="card">
            <h3 className="font-display font-bold text-blue-900 text-sm mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {[
                { to: '/predictions',   label: 'Run AI Prediction',    icon: '🤖' },
                { to: '/market-prices', label: 'Check Market Prices',  icon: '📈' },
                { to: '/ai-assistant',  label: 'Ask AI Assistant',     icon: '💬' },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-blue-700 hover:text-blue-900 transition-all text-sm group font-medium"
                >
                  <span>{icon}</span>
                  <span className="flex-1">{label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
