import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const llmConfig = {
  apiKey: process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? '',
  baseUrl: process.env.LLM_BASE_URL ?? process.env.OPENAI_BASE_URL ?? '',
  model: process.env.LLM_MODEL ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
};

console.log(llmConfig);

const buildFallbackPlan = (prompt, preferences) => {
  const duration = preferences?.durationDays ?? 3;
  const stopFor = (day) => [
    {
      id: `poi-${day}-1`,
      name: `Signature Experience Day ${day}`,
      description: `Auto-generated highlight informed by prompt: ${prompt?.slice(0, 60) ?? ''}...`,
    },
    {
      id: `poi-${day}-2`,
      name: `Local Favorite Day ${day}`,
      description: 'Placeholder stop. Replace with POI search results.',
    },
  ];

  return {
    title: 'AI Draft Itinerary',
    summary:
      'This is a scaffold generated locally because no LLM credentials were provided. Plug in a provider to get richer content.',
    durationDays: duration,
    budget: {
      currency: 'USD',
      amount: 150 * duration,
    },
    tags: preferences?.travelStyles ?? ['general'],
    days: Array.from({ length: duration }).map((_, idx) => ({
      dayNumber: idx + 1,
      title: `Day ${idx + 1}`,
      summary: 'Replace with AI-proposed narrative.',
      stops: stopFor(idx + 1),
    })),
  };
};

const openAiClient = (() => {
  if (!llmConfig.apiKey) {
    console.warn('[LLM] No API key detected (set LLM_API_KEY or OPENAI_API_KEY). Falling back to offline scaffold.');
    return null;
  }

  try {
    return new OpenAI({
      apiKey: llmConfig.apiKey,
      baseURL: llmConfig.baseUrl || undefined,
    });
  } catch (error) {
    console.error('Failed to initialize OpenAI client', error);
    return null;
  }
})();

const pullResponseText = (response) => {
  const carrier = response;
  const outputChunks =
    carrier?.output
      ?.flatMap((item) => item.content ?? [])
      ?.map((chunk) => chunk?.text?.trim())
      ?.filter((chunk) => Boolean(chunk)) ?? [];

  if (outputChunks.length) {
    return outputChunks.join('\n').trim();
  }

  const fallback = carrier?.output_text?.join('\n').trim();
  if (fallback) {
    return fallback;
  }

  throw new Error('OpenAI response did not include textual content');
};

const parseResponseJson = (response) => {
  const payload = pullResponseText(response);
  const sanitized = payload
    .replace(/```json/gi, '```')
    .replace(/```/g, '')
    .trim();
  const firstBrace = sanitized.indexOf('{');
  const lastBrace = sanitized.lastIndexOf('}');
  const jsonSlice = firstBrace !== -1 && lastBrace !== -1 ? sanitized.slice(firstBrace, lastBrace + 1) : sanitized;
  return JSON.parse(jsonSlice);
};

const buildItineraryPrompt = (prompt, preferences) => {
  const preferenceSummary = JSON.stringify(preferences ?? {}, null, 2);
  return `You are TourWise, an AI travel planner. Create a structured itinerary tailored to the traveler. Respond ONLY with JSON that matches the following shape:
{
  "title": string,
  "summary": string,
  "durationDays": number,
  "budget": { "currency": string, "amount": number, "perPerson"?: number, "notes"?: string },
  "tags": string[],
  "days": [
    {
      "dayNumber": number,
      "title"?: string,
      "summary"?: string,
      "stops": [
        {
          "id": string,
          "name": string,          
          "description"?: string,
          "location": { "city": string, "country": string, "address": string, "geo": { "lat": number, "lng": number } },
          "startTime"?: string,
          "endTime"?: string,
          "notes"?: string
        }
      ]
    }
  ]
}
Do not add arrivals and departures as itineraries. Offer restaurant's names, cafe's names and places exac names for itanaries. i.e. instead of 'Farewell Dinner', 'Farewell Dinner at ABC restaurat or coffee'
Brief: ${prompt}
Preferences JSON: ${preferenceSummary}`;
};

const buildPoiPrompt = (question, context) => {
  const contextBlock = context ? JSON.stringify(context, null, 2) : 'No additional context provided.';
  return `You are TourWise's travel concierge. Answer the travel question clearly and concisely. Respond ONLY with JSON like { "answer": string, "sources"?: string[] }.
Question: ${question}
Context: ${contextBlock}`;
};

export const requestItineraryPlan = async (prompt, preferences = {}) => {
  if (!openAiClient) {
    return buildFallbackPlan(prompt, preferences);
  }

  try {
    const response = await openAiClient.responses.create({
      model: llmConfig.model,
      input: buildItineraryPrompt(prompt, preferences),
      stream: false,
    });

    return parseResponseJson(response);
  } catch (error) {
    console.error('LLM request failed, returning fallback plan', error);
    return buildFallbackPlan(prompt, preferences);
  }
};

export const requestPoiAnswer = async (question, context = {}) => {
  if (!openAiClient) {
    return {
      answer: `Placeholder answer for: "${question}". Configure LLM credentials to enable real responses.`,
    };
  }

  try {
    const response = await openAiClient.responses.create({
      model: llmConfig.model,
      input: buildPoiPrompt(question, context),
      stream: false,
    });

    return parseResponseJson(response);
  } catch (error) {
    console.error('Chatbot request failed, returning fallback message', error);
    return {
      answer: 'We could not contact the AI assistant right now. Please try again in a few minutes.',
    };
  }
};

