import type { WeatherData } from '@/types';

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function getFarmingAdvice(temp: number, humidity: number, description: string): string {
  const desc = description.toLowerCase();

  if (desc.includes('rain') || desc.includes('drizzle')) {
    return 'Good conditions for watering. Hold off on pesticide applications. Check for soil waterlogging.';
  }
  if (temp > 35) {
    return 'Very hot conditions — irrigate early morning or evening. Shade sensitive seedlings. Avoid transplanting.';
  }
  if (temp > 28 && humidity > 70) {
    return 'Hot and humid — watch for fungal diseases. Ensure good airflow between crops.';
  }
  if (temp < 18) {
    return 'Cool conditions — good for leafy vegetables. Protect tropical crops from cold stress.';
  }
  if (desc.includes('clear') || desc.includes('sunny')) {
    return 'Excellent day for fieldwork, harvesting, and drying crops. Apply treatments if needed.';
  }
  return 'Moderate conditions — ideal for general farm activities including planting and weeding.';
}

export const weatherService = {
  async getWeather(location = 'Accra,GH'): Promise<WeatherData> {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`;

    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Weather data unavailable');
    }

    const data = await response.json();

    // Get rainfall probability from forecast endpoint
    let rainfallProbability = 0;
    try {
      const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric&cnt=8`;
      const forecastRes = await fetch(forecastUrl);
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        const maxPop = Math.max(...forecastData.list.slice(0, 4).map((f: { pop?: number }) => f.pop || 0));
        rainfallProbability = Math.round(maxPop * 100);
      }
    } catch {
      // Silently fail, rainfall stays 0
    }

    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const description = data.weather[0]?.description || 'clear sky';

    return {
      temperature: temp,
      feels_like: Math.round(data.main.feels_like),
      humidity,
      description,
      rainfall_probability: rainfallProbability,
      wind_speed: Math.round(data.wind?.speed || 0),
      location: `${data.name}, ${data.sys?.country || 'GH'}`,
      farming_advice: getFarmingAdvice(temp, humidity, description),
      icon: data.weather[0]?.icon || '01d',
    };
  },
};
