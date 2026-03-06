import { useState, useEffect } from 'react';
import { weatherService } from '@/services/weatherService';
import type { WeatherData } from '@/types';

export function useWeather(location = 'Accra,GH') {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    weatherService.getWeather(location)
      .then(data => {
        setWeather(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [location]);

  return { weather, loading, error };
}
