import type { AIResponse, ChatMessage } from '@/types';
import { supabase, TABLES } from '@/lib/supabase';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(messages: { role: string; content: string }[], maxTokens = 500): Promise<string> {
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export const aiService = {
  async predictDemand(userId: string, cropName: string): Promise<AIResponse> {
    const prompt = `You are an agricultural market expert for West Africa. 
Predict demand for ${cropName} in Ghana next month.

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "demand_score": <number 0-100>,
  "predicted_price": <number in GHS per kg>,
  "best_market": "<market name in Ghana>",
  "reasoning": "<2-3 sentence explanation>"
}

Consider seasonal patterns, typical Ghanaian market conditions, and current agricultural trends.`;

    const content = await callOpenAI([{ role: 'user', content: prompt }], 300);

    let parsed: AIResponse;
    try {
      const cleaned = content.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse AI prediction response');
    }

    // Save to Supabase
    await supabase.from(TABLES.PREDICTIONS).insert({
      user_id: userId,
      crop_name: cropName,
      demand_score: parsed.demand_score,
      predicted_price: parsed.predicted_price,
      best_market: parsed.best_market,
      reasoning: parsed.reasoning,
    });

    return parsed;
  },

  async getUserPredictions(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.PREDICTIONS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async chat(history: ChatMessage[], userMessage: string): Promise<string> {
    const systemPrompt = `You are AgroLink AI, a helpful agricultural assistant for African farmers, 
especially in Ghana and West Africa. You provide practical advice on:
- What crops to plant based on season and location
- Best markets to sell crops
- Farming techniques and timing
- Weather impacts on crops
- Pricing and negotiation strategies

Keep responses concise, practical, and farmer-friendly. Use simple language.
When asked about specific months, seasons or locations in Ghana, give specific actionable advice.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    return await callOpenAI(messages, 600);
  },
};
