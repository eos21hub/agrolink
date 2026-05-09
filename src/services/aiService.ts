import type { AIResponse, ChatMessage } from '@/types';
import { supabase, TABLES } from '@/lib/supabase';
import { cache } from '@/lib/cache';

const TTL_PREDICTIONS = 30 * 1000;        // 30s — invalidated on new prediction
const TTL_CROP_RESULT = 60 * 60 * 1000;  // 1h — mock results never change
const TTL_CHAT        = 5 * 60 * 1000;   // 5 min per unique message

const MOCK_PREDICTIONS: Record<string, AIResponse> = {
  maize:       { demand_score: 82, predicted_price: 3.20, best_market: 'Techiman Market',         reasoning: 'Maize demand is high heading into the dry season. Techiman remains the largest commodity hub in Ghana with strong buyer activity from food processors and northern traders.' },
  cassava:     { demand_score: 74, predicted_price: 1.90, best_market: 'Kumasi - Kejetia Market', reasoning: 'Cassava demand is steady driven by gari and fufu processors. Kejetia offers the highest volume buyers and consistent pricing throughout the month.' },
  yam:         { demand_score: 88, predicted_price: 5.10, best_market: 'Techiman Market',         reasoning: 'Yam is experiencing above-average demand due to the upcoming festive season. Techiman and Accra are both strong but Techiman offers better farm-gate prices.' },
  tomato:      { demand_score: 61, predicted_price: 5.80, best_market: 'Accra - Makola Market',  reasoning: 'Tomato supply is moderate this month. Makola Market has the highest retail demand but prices fluctuate. Consider staggered selling to maximise returns.' },
  plantain:    { demand_score: 79, predicted_price: 2.30, best_market: 'Kumasi - Kejetia Market', reasoning: 'Plantain demand is strong in urban markets. Kumasi is the best entry point with good road access and multiple wholesale buyers active this period.' },
  cocoa:       { demand_score: 91, predicted_price: 16.50, best_market: 'Takoradi Market Circle', reasoning: 'Cocoa is at peak export demand. COCOBOD buying centres are active and Takoradi port proximity gives the best logistics advantage for bulk sellers.' },
  rice:        { demand_score: 70, predicted_price: 6.20, best_market: 'Accra - Makola Market',  reasoning: 'Local rice demand is growing as consumers shift from imported varieties. Accra markets offer the best price premium for locally grown rice this month.' },
  pepper:      { demand_score: 65, predicted_price: 8.50, best_market: 'Accra - Makola Market',  reasoning: 'Pepper demand is moderate. Urban markets in Accra command higher prices due to restaurant and household demand. Avoid flooding the market at once.' },
  onion:       { demand_score: 77, predicted_price: 7.00, best_market: 'Tamale Central Market',  reasoning: 'Onion demand is high in northern markets with supply slightly below normal. Tamale Central offers the best prices and fastest turnover this period.' },
  groundnut:   { demand_score: 83, predicted_price: 7.80, best_market: 'Tamale Central Market',  reasoning: 'Groundnut is in strong demand for oil production and local consumption. Northern markets are the primary buyers with competitive pricing.' },
  sorghum:     { demand_score: 68, predicted_price: 3.00, best_market: 'Tamale Central Market',  reasoning: 'Sorghum demand is driven by the brewing and livestock feed industries. Northern markets remain the best destination for bulk sorghum sellers.' },
  millet:      { demand_score: 64, predicted_price: 2.70, best_market: 'Bolgatanga Market',      reasoning: 'Millet demand is stable with consistent buyers in the Upper regions. Bolgatanga is the most accessible market with reliable pricing.' },
  cowpea:      { demand_score: 72, predicted_price: 5.50, best_market: 'Techiman Market',        reasoning: 'Cowpea demand is growing ahead of the protein-focused consumption season. Techiman offers central access to buyers from multiple regions.' },
  okra:        { demand_score: 58, predicted_price: 4.50, best_market: 'Accra - Makola Market',  reasoning: 'Okra demand is moderate. Urban restaurants and households in Accra are the primary buyers. Fresh delivery within 24 hours of harvest maximises value.' },
  pineapple:   { demand_score: 75, predicted_price: 1.20, best_market: 'Tema Community Market',  reasoning: 'Pineapple export and local demand is strong. Tema port proximity makes it the best market for bulk pineapple with opportunities for juice processors.' },
  'garden egg':{ demand_score: 60, predicted_price: 4.00, best_market: 'Cape Coast Market',      reasoning: 'Garden egg demand is steady in coastal markets. Cape Coast has consistent household demand with stable prices throughout the month.' },
};

function getDefaultPrediction(cropName: string): AIResponse {
  const score = Math.floor(Math.random() * 40) + 50;
  const price = parseFloat((Math.random() * 5 + 2).toFixed(2));
  const markets = ['Techiman Market', 'Kumasi - Kejetia Market', 'Accra - Makola Market', 'Tamale Central Market'];
  const market = markets[Math.floor(Math.random() * markets.length)];
  return {
    demand_score: score,
    predicted_price: price,
    best_market: market,
    reasoning: `Based on current market trends in Ghana, ${cropName} shows ${score >= 70 ? 'strong' : 'moderate'} demand this month. ${market} is recommended as the primary selling destination due to active buyer presence and competitive pricing.`,
  };
}

const CHAT_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ['july', 'plant', 'crop'],
    response: `In July, Ghana is in the main rainy season — excellent for planting:\n\n🌽 **Maize** — ideal timing for second season planting\n🍅 **Tomato** — good growth with adequate rainfall\n🫘 **Cowpea** — thrives in July conditions\n🥬 **Leafy vegetables** — fast-growing in wet season\n\nAvoid drought-sensitive crops and ensure good drainage on your farm.`,
  },
  {
    keywords: ['best market', 'where sell', 'sell', 'market'],
    response: `The best markets in Ghana depend on your crop:\n\n📍 **Techiman Market** — best for yam, maize, cowpea\n📍 **Kumasi Kejetia** — best for cassava, plantain, vegetables\n📍 **Makola Market, Accra** — best for tomato, pepper, rice\n📍 **Tamale Central** — best for groundnut, sorghum, onion\n📍 **Takoradi** — best for cocoa and export crops\n\nWhat crop are you planning to sell?`,
  },
  {
    keywords: ['maize', 'corn'],
    response: `Maize is one of Ghana's most profitable staple crops right now:\n\n💰 Current price range: GHS 2.80–3.50/kg\n📍 Best market: Techiman Market\n📅 Peak demand: August–October\n\n**Tips:**\n• Harvest at 20% moisture content\n• Dry properly before selling to avoid aflatoxin rejection\n• Consider 50kg or 100kg sacks for bulk buyers`,
  },
  {
    keywords: ['weather', 'rain', 'season', 'harmattan'],
    response: `Ghana has two main farming seasons:\n\n☀️ **Major Season** (March–July) — main rains, best for maize, cassava, yam\n🌦️ **Minor Season** (Sept–Nov) — lighter rains, good for vegetables\n💨 **Harmattan** (Nov–Feb) — dry, best for groundnut, sorghum, millet\n\nCurrently ${new Date().getMonth() >= 2 && new Date().getMonth() <= 6 ? 'major rainy season — great for maize, cassava and yam' : 'minor season or dry period — focus on drought-tolerant crops'}.`,
  },
  {
    keywords: ['cocoa'],
    response: `Cocoa remains Ghana's most valuable cash crop:\n\n💰 Current price: ~GHS 15–17/kg\n📍 Best market: COCOBOD Licensed Buying Companies\n📅 Main harvest: October–March\n\n**Key advice:**\n• Only sell to COCOBOD-licensed buyers\n• Ferment pods for 6–8 days for premium grade\n• Dry to 7.5% moisture before selling`,
  },
  {
    keywords: ['store', 'storage', 'preserve', 'keep'],
    response: `Post-harvest storage tips:\n\n🌽 **Maize/Grains** — dry to 13% moisture, use hermetic bags\n🍠 **Yam** — cool shaded barns, good airflow\n🥔 **Cassava** — process within 48hrs (highly perishable)\n🍅 **Tomatoes** — sell within 3 days or process into paste\n\nHermetic PICS bags extend grain shelf life by 6–12 months.`,
  },
  {
    keywords: ['price', 'how much', 'cost', 'rate'],
    response: `Current approximate prices in Ghana (GHS/kg):\n\n• Maize: 2.50–3.20\n• Cassava: 1.60–1.90\n• Yam: 4.20–5.10\n• Tomato: 4.90–5.80\n• Plantain: 2.10–2.40\n• Cocoa: 15.00–17.00\n• Groundnut: 7.00–7.80\n• Rice: 5.50–6.20\n\nCheck the Market Prices page for live data.`,
  },
  {
    keywords: ['fertilizer', 'fertiliser', 'npk', 'compost'],
    response: `Fertilizer recommendations for Ghana crops:\n\n🌽 **Maize** — NPK 15-15-15 at planting, urea top-dress at 4–6 weeks\n🍠 **Yam** — NPK 12-12-17 for tuber development\n🍅 **Tomato** — balanced NPK + calcium\n🫘 **Legumes** — minimal nitrogen needed, they fix their own\n\n💡 Mix organic compost with inorganic fertilizer for best long-term results.`,
  },
];

function getMockChatResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const entry of CHAT_RESPONSES) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.response;
  }
  return `Great farming question! Here are some general tips for Ghanaian farmers:\n\n🌱 Align planting with seasonal rainfall patterns\n📊 Check market prices before harvesting\n🤝 Consider farmer cooperatives for better bulk pricing\n💧 Irrigation gives a competitive edge in dry season\n\nTry asking about a specific crop, market, or season for detailed advice!`;
}

export const aiService = {
  async predictDemand(userId: string, cropName: string): Promise<AIResponse> {
    const cropKey = cropName.toLowerCase().trim();
    const resultCacheKey = `ai:crop:${cropKey}`;

    let result = cache.get<AIResponse>(resultCacheKey);
    if (!result) {
      await new Promise(r => setTimeout(r, 1000));
      result = MOCK_PREDICTIONS[cropKey] ?? getDefaultPrediction(cropName);
      cache.set(resultCacheKey, result, TTL_CROP_RESULT);
    }

    await supabase.from(TABLES.PREDICTIONS).insert({
      user_id: userId,
      crop_name: cropName.toLowerCase(),
      demand_score: result.demand_score,
      predicted_price: result.predicted_price,
      best_market: result.best_market,
      reasoning: result.reasoning,
    });

    cache.invalidate(`ai:predictions:${userId}`);
    return result;
  },

  async getUserPredictions(userId: string) {
    const key = `ai:predictions:${userId}`;
    const cached = cache.get<unknown[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from(TABLES.PREDICTIONS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    cache.set(key, data, TTL_PREDICTIONS);
    return data;
  },

  async chat(_history: ChatMessage[], userMessage: string): Promise<string> {
    const key = `ai:chat:${userMessage.toLowerCase().trim()}`;
    const cached = cache.get<string>(key);
    if (cached) return cached;

    await new Promise(r => setTimeout(r, 700 + Math.random() * 400));
    const response = getMockChatResponse(userMessage);
    cache.set(key, response, TTL_CHAT);
    return response;
  },
};