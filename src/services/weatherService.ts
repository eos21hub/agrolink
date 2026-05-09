import type { WeatherData } from '@/types';

const MOCK_WEATHER_BY_REGION: Record<string, Partial<WeatherData>> = {
  'greater accra': { temperature: 32, feels_like: 35, humidity: 78, description: 'partly cloudy', rainfall_probability: 20, wind_speed: 4, icon: '02d' },
  'ashanti':       { temperature: 28, feels_like: 30, humidity: 85, description: 'light rain', rainfall_probability: 65, wind_speed: 3, icon: '10d' },
  'western':       { temperature: 27, feels_like: 29, humidity: 88, description: 'moderate rain', rainfall_probability: 80, wind_speed: 5, icon: '10d' },
  'eastern':       { temperature: 29, feels_like: 31, humidity: 80, description: 'scattered clouds', rainfall_probability: 35, wind_speed: 3, icon: '03d' },
  'central':       { temperature: 30, feels_like: 33, humidity: 82, description: 'clear sky', rainfall_probability: 10, wind_speed: 6, icon: '01d' },
  'volta':         { temperature: 31, feels_like: 34, humidity: 75, description: 'few clouds', rainfall_probability: 15, wind_speed: 4, icon: '02d' },
  'northern':      { temperature: 36, feels_like: 39, humidity: 45, description: 'clear sky', rainfall_probability: 5,  wind_speed: 7, icon: '01d' },
  'upper east':    { temperature: 38, feels_like: 41, humidity: 38, description: 'sunny', rainfall_probability: 3,  wind_speed: 8, icon: '01d' },
  'upper west':    { temperature: 37, feels_like: 40, humidity: 40, description: 'haze', rainfall_probability: 8,  wind_speed: 6, icon: '50d' },
  'brong-ahafo':   { temperature: 30, feels_like: 32, humidity: 76, description: 'overcast clouds', rainfall_probability: 40, wind_speed: 3, icon: '04d' },
};

function getFarmingAdvice(temp: number, humidity: number, description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('rain'))                return 'Good conditions for watering. Hold off on pesticide applications. Check for soil waterlogging.';
  if (temp > 35)                            return 'Very hot — irrigate early morning or evening. Shade sensitive seedlings. Avoid transplanting today.';
  if (temp > 28 && humidity > 70)           return 'Hot and humid — watch for fungal diseases. Ensure good airflow between crops.';
  if (desc.includes('clear') || temp > 30) return 'Excellent day for fieldwork, harvesting, and drying crops. Apply treatments if needed.';
  return 'Moderate conditions — ideal for planting, weeding, and general farm activities.';
}

function getLocationKey(location: string): string {
  const l = location.toLowerCase();
  for (const key of Object.keys(MOCK_WEATHER_BY_REGION)) {
    if (l.includes(key)) return key;
  }
  return 'greater accra';
}

export const weatherService = {
  async getWeather(location = 'Accra,GH'): Promise<WeatherData> {
    await new Promise(r => setTimeout(r, 600));

    const key = getLocationKey(location);
    const mock = MOCK_WEATHER_BY_REGION[key];
    const temp = mock.temperature!;
    const humidity = mock.humidity!;
    const description = mock.description!;
    const jitter = (n: number, range = 2) => Math.round(n + (Math.random() * range * 2 - range));

    return {
      temperature: jitter(temp),
      feels_like: jitter(mock.feels_like!),
      humidity: jitter(humidity, 3),
      description,
      rainfall_probability: mock.rainfall_probability!,
      wind_speed: jitter(mock.wind_speed!, 1),
      location: location.includes(',') ? location.replace(',GH', ', Ghana') : `${location}, Ghana`,
      farming_advice: getFarmingAdvice(temp, humidity, description),
      icon: mock.icon!,
    };
  },
};