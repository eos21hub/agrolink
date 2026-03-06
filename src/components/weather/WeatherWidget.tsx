import { Droplets, Wind, Thermometer, CloudRain, Sprout } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';

interface WeatherWidgetProps {
  location?: string;
  compact?: boolean;
}

export function WeatherWidget({ location = 'Accra,GH', compact = false }: WeatherWidgetProps) {
  const { weather, loading, error } = useWeather(location);

  if (loading) {
    return (
      <div className="card animate-pulse-slow">
        <div className="flex items-center justify-center h-24">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="card">
        <div className="text-center py-4 text-earth-600 text-sm">
          Weather data unavailable
        </div>
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
            <div className="font-display font-bold text-2xl text-earth-100">{weather.temperature}°C</div>
            <div className="text-xs text-earth-500 capitalize">{weather.description}</div>
            <div className="text-xs text-earth-600">{weather.location}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="flex items-center gap-1 text-xs text-earth-400">
              <Droplets className="w-3 h-3 text-blue-400" />
              {weather.humidity}% humidity
            </div>
            <div className="flex items-center gap-1 text-xs text-earth-400 mt-1">
              <CloudRain className="w-3 h-3 text-blue-300" />
              {weather.rainfall_probability}% rain
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-earth-300 text-sm uppercase tracking-widest">Weather</h3>
          <p className="text-xs text-earth-600 mt-0.5">{weather.location}</p>
        </div>
        <img src={iconUrl} alt={weather.description} className="w-14 h-14" />
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="font-display font-bold text-5xl text-earth-50">{weather.temperature}°</span>
        <div className="mb-1.5">
          <div className="text-sm text-earth-300 capitalize">{weather.description}</div>
          <div className="text-xs text-earth-600">Feels like {weather.feels_like}°C</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-forest-900/20 rounded-lg p-2.5 border border-forest-800/20 text-center">
          <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <div className="font-mono font-semibold text-sm text-earth-200">{weather.humidity}%</div>
          <div className="text-xs text-earth-600">Humidity</div>
        </div>
        <div className="bg-forest-900/20 rounded-lg p-2.5 border border-forest-800/20 text-center">
          <CloudRain className="w-4 h-4 text-blue-300 mx-auto mb-1" />
          <div className="font-mono font-semibold text-sm text-earth-200">{weather.rainfall_probability}%</div>
          <div className="text-xs text-earth-600">Rain</div>
        </div>
        <div className="bg-forest-900/20 rounded-lg p-2.5 border border-forest-800/20 text-center">
          <Wind className="w-4 h-4 text-earth-400 mx-auto mb-1" />
          <div className="font-mono font-semibold text-sm text-earth-200">{weather.wind_speed}m/s</div>
          <div className="text-xs text-earth-600">Wind</div>
        </div>
      </div>

      <div className="bg-forest-900/30 rounded-lg p-3 border border-forest-700/20">
        <div className="flex items-start gap-2">
          <Sprout className="w-4 h-4 text-forest-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-earth-400 leading-relaxed">{weather.farming_advice}</p>
        </div>
      </div>
    </div>
  );
}
