import type { WeatherData, WeatherAlert, WeatherForecastDay, HourlyForecast } from '@/types';

// ── Region base data ──────────────────────────────────────────────────────────

interface RegionProfile {
  temperature: number;
  feels_like: number;
  humidity: number;
  description: string;
  rainfall_probability: number;
  wind_speed: number;
  icon: string;
  pressure: number;      // hPa
  uv_index: number;
  visibility: number;    // km
  cloud_coverage: number; // %
  lat: number;
}

const REGIONS: Record<string, RegionProfile> = {
  'greater accra': { temperature: 32, feels_like: 35, humidity: 78, description: 'partly cloudy',   rainfall_probability: 20, wind_speed: 4,  icon: '02d', pressure: 1011, uv_index: 9,  visibility: 10, cloud_coverage: 35, lat: 5.6 },
  'ashanti':       { temperature: 28, feels_like: 30, humidity: 85, description: 'light rain',       rainfall_probability: 65, wind_speed: 3,  icon: '10d', pressure: 1009, uv_index: 7,  visibility: 7,  cloud_coverage: 75, lat: 6.7 },
  'western':       { temperature: 27, feels_like: 29, humidity: 88, description: 'moderate rain',    rainfall_probability: 80, wind_speed: 5,  icon: '10d', pressure: 1008, uv_index: 6,  visibility: 6,  cloud_coverage: 85, lat: 5.1 },
  'eastern':       { temperature: 29, feels_like: 31, humidity: 80, description: 'scattered clouds', rainfall_probability: 35, wind_speed: 3,  icon: '03d', pressure: 1010, uv_index: 8,  visibility: 9,  cloud_coverage: 45, lat: 6.1 },
  'central':       { temperature: 30, feels_like: 33, humidity: 82, description: 'clear sky',        rainfall_probability: 10, wind_speed: 6,  icon: '01d', pressure: 1012, uv_index: 9,  visibility: 10, cloud_coverage: 10, lat: 5.5 },
  'volta':         { temperature: 31, feels_like: 34, humidity: 75, description: 'few clouds',       rainfall_probability: 15, wind_speed: 4,  icon: '02d', pressure: 1010, uv_index: 9,  visibility: 10, cloud_coverage: 20, lat: 7.0 },
  'northern':      { temperature: 36, feels_like: 39, humidity: 45, description: 'clear sky',        rainfall_probability: 5,  wind_speed: 7,  icon: '01d', pressure: 1006, uv_index: 11, visibility: 10, cloud_coverage: 5,  lat: 9.4 },
  'upper east':    { temperature: 38, feels_like: 41, humidity: 38, description: 'sunny',            rainfall_probability: 3,  wind_speed: 8,  icon: '01d', pressure: 1005, uv_index: 12, visibility: 10, cloud_coverage: 0,  lat: 10.8 },
  'upper west':    { temperature: 37, feels_like: 40, humidity: 40, description: 'haze',             rainfall_probability: 8,  wind_speed: 6,  icon: '50d', pressure: 1005, uv_index: 11, visibility: 5,  cloud_coverage: 15, lat: 10.3 },
  'brong-ahafo':   { temperature: 30, feels_like: 32, humidity: 76, description: 'overcast clouds',  rainfall_probability: 40, wind_speed: 3,  icon: '04d', pressure: 1009, uv_index: 8,  visibility: 8,  cloud_coverage: 90, lat: 7.9 },
};

// ── Seasonal modifiers (Ghana: major rains Apr-Jul, minor Sep-Oct, harmattan Nov-Mar) ──

function getSeason(month: number): string {
  if (month >= 3 && month <= 6)  return 'Major Rainy Season';
  if (month >= 8 && month <= 9)  return 'Minor Rainy Season';
  if (month === 7)               return 'Minor Dry Season';
  return 'Dry Season (Harmattan)';
}

interface SeasonalDelta {
  tempDelta: number;
  humidityDelta: number;
  rainProbDelta: number;
  uvDelta: number;
  visibilityMult: number;
}

function getSeasonalDelta(month: number, isNorth: boolean): SeasonalDelta {
  const season = getSeason(month);
  if (season === 'Major Rainy Season') {
    return { tempDelta: -3, humidityDelta: 10, rainProbDelta: 25, uvDelta: -2, visibilityMult: 0.7 };
  }
  if (season === 'Minor Rainy Season') {
    return { tempDelta: -1, humidityDelta: 5, rainProbDelta: 15, uvDelta: -1, visibilityMult: 0.85 };
  }
  if (season === 'Dry Season (Harmattan)' && isNorth) {
    return { tempDelta: 2, humidityDelta: -20, rainProbDelta: -10, uvDelta: 1, visibilityMult: 0.4 };
  }
  return { tempDelta: 1, humidityDelta: -5, rainProbDelta: -5, uvDelta: 1, visibilityMult: 1 };
}

// ── Sunrise / sunset (Ghana sits 5–11°N, so very stable ~5:52 / 18:08) ───────

function getSunTimes(lat: number, month: number): { sunrise: string; sunset: string } {
  // Rough offset: +/- 10 min from equinox baseline by month and latitude
  const riseBase = 352; // minutes from midnight ≈ 5:52
  const setBase  = 1088; // ≈ 18:08
  const latOffset = Math.round((lat - 7) * 0.5);
  const monthOffset = [0, -5, -8, -5, 0, 5, 8, 5, 0, -3, -5, -2][month] ?? 0;
  const fmt = (m: number) => {
    const h = Math.floor(m / 60).toString().padStart(2, '0');
    const min = (m % 60).toString().padStart(2, '0');
    return `${h}:${min}`;
  };
  return {
    sunrise: fmt(riseBase + latOffset + monthOffset),
    sunset:  fmt(setBase  - latOffset + monthOffset),
  };
}

// ── Dew point (Magnus approximation) ─────────────────────────────────────────

function dewPoint(tempC: number, humidity: number): number {
  const a = 17.27, b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
  return Math.round((b * alpha) / (a - alpha) * 10) / 10;
}

// ── Alert generation ──────────────────────────────────────────────────────────

function buildAlerts(temp: number, humidity: number, wind: number, rainProb: number, season: string, desc: string): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const isHarmattan = season === 'Dry Season (Harmattan)';

  if (temp >= 38) {
    alerts.push({ type: 'heat_stress', severity: 'high',   message: `Extreme heat: ${temp}°C. Dangerous for outdoor work.`,   farming_impact: 'Halt fieldwork 10am–3pm. Emergency irrigation for all crops. Shade nurseries immediately.' });
  } else if (temp >= 35) {
    alerts.push({ type: 'heat_stress', severity: 'medium', message: `High heat: ${temp}°C. Limit midday exposure.`,            farming_impact: 'Irrigate early morning and evening. Avoid transplanting. Check for wilting.' });
  }

  if (rainProb >= 75 || desc.includes('heavy') || desc.includes('thunder')) {
    alerts.push({ type: 'heavy_rain',  severity: 'high',   message: 'Heavy rainfall expected. Risk of flash flooding.',       farming_impact: 'Avoid pesticide/fertiliser application. Check drainage channels. Secure harvested produce.' });
  } else if (rainProb >= 50) {
    alerts.push({ type: 'flood_risk',  severity: 'low',    message: 'Elevated rainfall. Low-lying fields may waterlog.',       farming_impact: 'Monitor soil drainage. Delay soil preparation on flood-prone plots.' });
  }

  if (wind >= 8) {
    alerts.push({ type: 'strong_wind', severity: wind >= 10 ? 'high' : 'medium', message: `Strong winds: ${wind} m/s.`,      farming_impact: 'Stake tall crops (maize, sorghum). Postpone aerial spraying. Secure shade nets.' });
  }

  if (isHarmattan && humidity < 35) {
    alerts.push({ type: 'harmattan',   severity: humidity < 25 ? 'high' : 'medium', message: 'Harmattan conditions. Very dry air and reduced visibility.', farming_impact: 'Increase irrigation frequency. Mulch to retain soil moisture. Cover seedbeds overnight.' });
  }

  if (rainProb < 10 && temp > 34 && !isHarmattan) {
    alerts.push({ type: 'drought_risk', severity: 'low',   message: 'Dry spell conditions. Low rainfall probability.',        farming_impact: 'Conserve water. Prioritise irrigation for young crops. Consider drought-tolerant varieties.' });
  }

  return alerts;
}

// ── Farming advice ────────────────────────────────────────────────────────────

function farmingAdvice(temp: number, humidity: number, description: string, season: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('thunder'))                           return 'Thunderstorm risk — stay off open fields. Check drainage and secure equipment.';
  if (desc.includes('heavy rain') || desc.includes('moderate rain')) return 'Significant rainfall — hold pesticide/fertiliser applications. Inspect drainage. Good for water harvesting.';
  if (desc.includes('light rain') || desc.includes('drizzle'))       return 'Light rain — good conditions for transplanting seedlings. Delay chemical spraying until it clears.';
  if (season === 'Dry Season (Harmattan)')                return 'Harmattan season — irrigate frequently, mulch beds, and protect crops from dry winds. Ideal for land preparation.';
  if (temp >= 35)                                         return 'Very hot — irrigate early morning or after 4pm. Shade sensitive seedlings. Avoid transplanting midday.';
  if (temp > 28 && humidity > 75)                         return 'Hot and humid — watch for fungal diseases. Ensure good airflow between crop rows. Scout for pests.';
  if (desc.includes('clear') || desc.includes('sunny'))  return 'Excellent day for fieldwork, harvesting, and drying crops. Apply foliar treatments if needed.';
  if (desc.includes('overcast') || desc.includes('cloud')) return 'Overcast conditions — good for planting and transplanting. Monitor for diseases in dense canopies.';
  return 'Moderate conditions — ideal for planting, weeding, and general farm activities.';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function jitter(n: number, range = 2): number {
  return Math.round((n + (Math.random() * range * 2 - range)) * 10) / 10;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function getRegionKey(location: string): string {
  const l = location.toLowerCase();
  for (const key of Object.keys(REGIONS)) {
    if (l.includes(key)) return key;
  }
  return 'greater accra';
}

function formatLocation(location: string): string {
  if (location.includes(',GH') || location.endsWith(',GH')) {
    return location.replace(',GH', ', Ghana');
  }
  return location.includes('Ghana') ? location : `${location}, Ghana`;
}

// ── Forecast helpers ──────────────────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const FORECAST_ICONS: Array<{ icon: string; description: string; rainProb: number }> = [
  { icon: '01d', description: 'clear sky',        rainProb: 5  },
  { icon: '02d', description: 'few clouds',       rainProb: 10 },
  { icon: '03d', description: 'scattered clouds', rainProb: 25 },
  { icon: '04d', description: 'overcast clouds',  rainProb: 40 },
  { icon: '09d', description: 'shower rain',      rainProb: 60 },
  { icon: '10d', description: 'light rain',       rainProb: 70 },
  { icon: '10d', description: 'moderate rain',    rainProb: 80 },
  { icon: '11d', description: 'thunderstorm',     rainProb: 90 },
  { icon: '50d', description: 'haze',             rainProb: 8  },
];

function pickCondition(baseRainProb: number): typeof FORECAST_ICONS[number] {
  const drift = baseRainProb + (Math.random() * 30 - 15);
  return FORECAST_ICONS.reduce((best, c) =>
    Math.abs(c.rainProb - drift) < Math.abs(best.rainProb - drift) ? c : best
  );
}

function forecastFarmingNote(description: string, high: number): string {
  const d = description.toLowerCase();
  if (d.includes('thunder'))                      return 'Avoid fieldwork. Secure equipment and check drainage.';
  if (d.includes('moderate rain') || d.includes('shower')) return 'High rain — avoid spraying. Good for soil moisture recharge.';
  if (d.includes('light rain'))                   return 'Light rain expected — good for transplanting in the morning.';
  if (d.includes('overcast'))                     return 'Cloudy — good planting day. Watch for fungal pressure.';
  if (d.includes('haze'))                         return 'Hazy — irrigate crops. Limit dust-sensitive operations.';
  if (high >= 35)                                 return 'Very hot — schedule irrigation at dawn or dusk.';
  return 'Good day for general fieldwork and crop management.';
}

// ── Public service ────────────────────────────────────────────────────────────

export const weatherService = {
  async getWeather(location = 'Accra,GH'): Promise<WeatherData> {
    await new Promise(r => setTimeout(r, 600));

    const key    = getRegionKey(location);
    const base   = REGIONS[key];
    const now    = new Date();
    const month  = now.getMonth();
    const isNorth = base.lat > 8;
    const season = getSeason(month);
    const delta  = getSeasonalDelta(month, isNorth);

    const temp     = clamp(Math.round(jitter(base.temperature + delta.tempDelta)), 20, 45);
    const feelsLike = clamp(Math.round(jitter(base.feels_like + delta.tempDelta)), 22, 48);
    const humidity  = clamp(Math.round(jitter(base.humidity + delta.humidityDelta, 3)), 20, 100);
    const rainProb  = clamp(Math.round(base.rainfall_probability + delta.rainProbDelta), 0, 100);
    const wind      = clamp(Math.round(jitter(base.wind_speed, 1) * 10) / 10, 0, 25);
    const uvIndex   = clamp(Math.round(jitter(base.uv_index + delta.uvDelta, 1)), 0, 12);
    const pressure  = clamp(Math.round(jitter(base.pressure, 2)), 990, 1025);
    const visibility = clamp(Math.round(base.visibility * delta.visibilityMult * 10) / 10, 0.5, 10);
    const clouds    = clamp(Math.round(jitter(base.cloud_coverage, 5)), 0, 100);
    const { sunrise, sunset } = getSunTimes(base.lat, month);

    return {
      temperature: temp,
      feels_like: feelsLike,
      humidity,
      description: base.description,
      rainfall_probability: rainProb,
      wind_speed: wind,
      location: formatLocation(location),
      farming_advice: farmingAdvice(temp, humidity, base.description, season),
      icon: base.icon,
      uv_index: uvIndex,
      pressure,
      visibility,
      cloud_coverage: clouds,
      dew_point: dewPoint(temp, humidity),
      season,
      sunrise,
      sunset,
      alerts: buildAlerts(temp, humidity, wind, rainProb, season, base.description),
    };
  },

  async getForecast(location = 'Accra,GH', days = 7): Promise<WeatherForecastDay[]> {
    await new Promise(r => setTimeout(r, 800));

    const key   = getRegionKey(location);
    const base  = REGIONS[key];
    const now   = new Date();
    const month = now.getMonth();
    const delta = getSeasonalDelta(month, base.lat > 8);

    return Array.from({ length: days }, (_, i) => {
      const date    = new Date(now);
      date.setDate(date.getDate() + i + 1);
      const condition = pickCondition(base.rainfall_probability + delta.rainProbDelta);
      const high    = clamp(Math.round(jitter(base.temperature + delta.tempDelta, 2)), 20, 45);
      const low     = clamp(high - Math.round(4 + Math.random() * 4), 15, high - 2);
      const humidity = clamp(Math.round(jitter(base.humidity + delta.humidityDelta, 5)), 20, 100);
      const wind    = clamp(Math.round(jitter(base.wind_speed, 1.5) * 10) / 10, 0, 25);

      return {
        date:                 date.toISOString().split('T')[0],
        day_name:             i === 0 ? 'Tomorrow' : DAY_NAMES[date.getDay()],
        high,
        low,
        humidity,
        rainfall_probability: clamp(condition.rainProb + Math.round(Math.random() * 10 - 5), 0, 100),
        wind_speed:           wind,
        description:          condition.description,
        icon:                 condition.icon,
        farming_note:         forecastFarmingNote(condition.description, high),
      };
    });
  },

  async getHourlyForecast(location = 'Accra,GH'): Promise<HourlyForecast[]> {
    await new Promise(r => setTimeout(r, 500));

    const key   = getRegionKey(location);
    const base  = REGIONS[key];
    const month = new Date().getMonth();
    const delta = getSeasonalDelta(month, base.lat > 8);
    const baseTemp = base.temperature + delta.tempDelta;
    const baseRain = base.rainfall_probability + delta.rainProbDelta;

    // 24 hourly slots starting at next full hour
    const now = new Date();
    const startHour = now.getHours() + 1;

    return Array.from({ length: 24 }, (_, i) => {
      const hour = (startHour + i) % 24;
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;

      // Diurnal temperature curve: min ~6am, peak ~2pm
      const diurnalOffset = -3 * Math.cos((2 * Math.PI * (hour - 14)) / 24);
      const temp = clamp(Math.round(baseTemp + diurnalOffset + (Math.random() * 2 - 1)), 18, 45);

      // Rain more likely in afternoon (12–17h) during rainy season
      const afternoonBias = (hour >= 12 && hour <= 17) ? 15 : 0;
      const rainProb = clamp(Math.round(baseRain + afternoonBias + (Math.random() * 20 - 10)), 0, 100);

      const condition = pickCondition(rainProb);
      const isDaytime = hour >= 6 && hour < 18;

      return {
        time:                 timeStr,
        temperature:          temp,
        rainfall_probability: rainProb,
        description:          condition.description,
        icon:                 isDaytime ? condition.icon : condition.icon.replace('d', 'n'),
        wind_speed:           clamp(Math.round(jitter(base.wind_speed, 1.5) * 10) / 10, 0, 25),
      };
    });
  },
};
