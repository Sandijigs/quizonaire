import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

export const ankrSomniaUrl = `https://rpc.ankr.com/somnia_testnet/${
  process.env.VITE_ANKR_API_KEY
}`;

export const somniaSubGraphApi =
  'https://api.subgraph.somnia.network/public_api/data_api/somnia/v1';

export const somniaSubgraphConfig = {
  headers: {
    Authorization: process.env.VITE_SUBGRAPH_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 20000,
};

let breakCycle = 0;
export const requestToOpenRouter = async (
  context: string,
  otherModel?: string
): Promise<string> => {
  // Try Gemini first if API key is available
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    console.log('Using Google Gemini API for quiz generation...');
    try {
      const result = await requestToGemini(context);
      if (result) {
        console.log('Gemini request successful');
        return result;
      }
    } catch (error: any) {
      console.warn('Gemini API failed, trying OpenRouter...', error.message);
    }
  }

  // Fallback to OpenRouter
  const listOfModels = [
    'qwen/qwen3-32b',
    'nousresearch/hermes-4-70b',
    'google/gemini-2.5-pro',
  ];

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('No API key configured. Please add VITE_GEMINI_API_KEY or VITE_OPENROUTER_API_KEY to your .env file');
  }

  try {
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const model = otherModel ?? 'qwen/qwen3-coder:free';

    console.log(`Attempting OpenRouter request with model: ${model}, attempt: ${breakCycle + 1}`);

    const data = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: context }],
      stream: false,
    });

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://quizonaire.vercel.app',
        'X-Title': 'Quizonaire',
        'Content-Type': 'application/json',
      },
    });

    const content: string = response.data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('OpenRouter response:', response.data);
      throw new Error('OpenRouter returned empty content');
    }

    breakCycle = 0;
    console.log('OpenRouter request successful');
    return content;
  } catch (error: any) {
    console.error(`OpenRouter error (attempt ${breakCycle + 1}):`, error.response?.data || error.message);

    if (breakCycle >= 4) {
      breakCycle = 0;
      throw new Error(
        `Failed after 5 attempts. Last error: ${error.response?.data?.error?.message || error.message}`
      );
    }

    breakCycle++;
    const modelIndex = breakCycle - 1;
    console.log(`Retrying with model: ${listOfModels[modelIndex < 0 || modelIndex > 2 ? 0 : modelIndex]}`);

    return await requestToOpenRouter(
      context,
      listOfModels[modelIndex < 0 || modelIndex > 2 ? 0 : modelIndex]
    );
  }
};

let ai: GoogleGenAI | null = null;

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const requestToGemini = async (
  context: string
): Promise<string | undefined> => {
  const geminiClient = getGeminiClient();

  if (!geminiClient) {
    console.warn('Google Gemini API key not configured. Skipping Gemini request.');
    return;
  }

  try {
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: context }],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error('Gemini model answered with error:', error);
  }
};

export const requestToStabilityAI = async (context: string) => {
  try {
    const url = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';

    const data = JSON.stringify({
      text_prompts: [{ text: context }],
      cfg_scale: 7.5,
      clip_guidance_preset: 'FAST_BLUE',
      height: 512,
      width: 512,
      samples: 1,
      steps: 50,
    });

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
};
