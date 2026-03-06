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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-earth-500 text-sm font-body mb-1">{greeting} 👋</p>
          <h1 className="page-title">{user?.full_name?.split(' ')[0] || 'Farmer'}</h1>
          <p className="text-earth-500 text-sm mt-1">{user?.region}, Ghana</p>
        </div>
        <Link to="/upload-crop" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Crop
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Crops', value: crops.length, icon: Wheat, color: 'text-forest-400', bg: 'bg-forest-900/20' },
          { label: 'Active Listings', value: activeCrops, icon: TrendingUp, color: 'text-savanna-400', bg: 'bg-savanna-900/20' },
          { label: 'Predictions Run', value: predictions.length, icon: BarChart3, color: 'text-earth-400', bg: 'bg-earth-900/20' },
          { label: 'Avg Demand Score', value: avgDemand ? `${avgDemand}/100` : '—', icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={label} className="card animate-slide-up" style={{ animationDelay: `${i * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}>
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="stat-value">{loading ? '—' : value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Recent crops + market prices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent crops */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Recent Crops</h2>
              <Link to="/upload-crop" className="text-xs text-forest-400 hover:text-forest-300 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map(i => <div key={i} className="card h-32 animate-pulse-slow" />)}
              </div>
            ) : crops.length === 0 ? (
              <div className="card text-center py-8">
                <Wheat className="w-8 h-8 text-earth-700 mx-auto mb-2" />
                <p className="text-earth-500 text-sm">No crops uploaded yet</p>
                <Link to="/upload-crop" className="btn-primary inline-flex mt-3 text-xs">Upload your first crop</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {crops.slice(0, 4).map(crop => <CropCard key={crop.id} crop={crop} />)}
              </div>
            )}
          </section>

          {/* Market prices preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Latest Market Prices</h2>
              <Link to="/market-prices" className="text-xs text-forest-400 hover:text-forest-300 flex items-center gap-1 transition-colors">
                Full table <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-forest-900/20">
                    <th className="px-4 py-3 text-left text-xs font-display font-semibold text-earth-500 uppercase tracking-wider">Crop</th>
                    <th className="px-4 py-3 text-left text-xs font-display font-semibold text-earth-500 uppercase tracking-wider">Market</th>
                    <th className="px-4 py-3 text-right text-xs font-display font-semibold text-earth-500 uppercase tracking-wider">GHS/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-earth-600 text-xs">Loading...</td></tr>
                  ) : prices.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-earth-600 text-xs">No market data yet</td></tr>
                  ) : (
                    prices.map((p, i) => (
                      <tr key={p.id} className={`${i !== prices.length - 1 ? 'border-b border-forest-900/10' : ''} hover:bg-forest-900/10 transition-colors`}>
                        <td className="px-4 py-3 font-medium text-earth-200 capitalize">{p.crop}</td>
                        <td className="px-4 py-3 text-earth-500">{p.market}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-savanna-300">{p.price_per_kg}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right: Weather */}
        <div className="space-y-4">
          <h2 className="section-title">Weather</h2>
          <WeatherWidget location={user?.region ? `${user.region},GH` : 'Accra,GH'} />

          {/* Quick actions */}
          <div className="card">
            <h3 className="font-display font-semibold text-earth-300 text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { to: '/predictions', label: 'Run AI Prediction', icon: '🤖' },
                { to: '/market-prices', label: 'Check Market Prices', icon: '📈' },
                { to: '/ai-assistant', label: 'Ask AI Assistant', icon: '💬' },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-forest-900/20 text-earth-400 hover:text-earth-200 transition-all text-sm group">
                  <span>{icon}</span>
                  <span className="flex-1">{label}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
