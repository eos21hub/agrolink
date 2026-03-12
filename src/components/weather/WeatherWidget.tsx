import { Droplets, Wind, CloudRain, Sprout } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';

interface WeatherWidgetProps {
  location?: string;
  compact?: boolean;
}

export function WeatherWidget({ location = 'Accra,GH', compact = false }: WeatherWidgetProps) {
  const { weather, loading, error } = useWeather(location);

  if (loading) {
    return (
      <div className="card animate-pulse-slow flex items-center justify-center h-24">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="card text-center py-4 text-slate-400 text-sm">
        Weather data unavailable
      </div>
    );
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  if (compact) {
    return (
      <div className="card">
        <div className="flex items-center gap-4">
          <img src={iconUrl} alt={weather.description} className="w-12 h-12" />
          <div>
            <div className="font-display font-bold text-2xl text-indigo-950">{weather.temperature}°C</div>
            <div className="text-xs text-indigo-600 capitalize">{weather.description}</div>
            <div className="text-xs text-slate-400">{weather.location}</div>
          </div>
          <div className="ml-auto text-right space-y-1">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Droplets className="w-3 h-3 text-slate-400" />
              {weather.humidity}% humidity
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <CloudRain className="w-3 h-3 text-slate-400" />
              {weather.rainfall_probability}% rain
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-bold text-slate-400 text-xs uppercase tracking-widest">Weather</h3>
          <p className="text-xs text-slate-400 mt-0.5">{weather.location}</p>
        </div>
        <img src={iconUrl} alt={weather.description} className="w-14 h-14" />
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="font-display font-bold text-5xl text-indigo-950">{weather.temperature}°</span>
        <div className="mb-1.5">
          <div className="text-sm text-indigo-700 capitalize font-semibold">{weather.description}</div>
          <div className="text-xs text-slate-400">Feels like {weather.feels_like}°C</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: Droplets, value: `${weather.humidity}%`,                label: 'Humidity', color: 'text-slate-500' },
          { icon: CloudRain, value: `${weather.rainfall_probability}%`,   label: 'Rain',     color: 'text-cyan-500' },
          { icon: Wind,      value: `${weather.wind_speed}m/s`,           label: 'Wind',     color: 'text-indigo-400' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-blue-50 rounded-xl p-2.5 border border-blue-100 text-center">
            <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
            <div className="font-mono font-bold text-sm text-indigo-900">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
        <div className="flex items-start gap-2">
          <Sprout className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 leading-relaxed">{weather.farming_advice}</p>
        </div>
      </div>
    </div>
  );
}
