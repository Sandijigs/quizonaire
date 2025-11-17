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
  const listOfModels = [
    'qwen/qwen3-32b',
    'nousresearch/hermes-4-70b',
    'google/gemini-2.5-pro',
  ];

  try {
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    const data = JSON.stringify({
      model: otherModel ?? 'qwen/qwen3-coder:free',
      messages: [{ role: 'user', content: context }],
      stream: false,
    });

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
        'HTTP-Referer': 'https://somniapresentor.info/',
        'X-Title': 'Somnia Presentor',
        'Content-Type': 'application/json',
      },
    });

    const content: string = response.data.choices?.[0]?.message?.content;
    breakCycle = 0;

    return content;
  } catch (error) {
    if (breakCycle >= 5) {
      throw new Error(
        'Sorry, something wrong with LLM service! It will fix as soon as possible!'
      );
    }
    breakCycle++;
    const modelIndex = breakCycle - 1;
    console.error(error);
    return await requestToOpenRouter(
      context,
      listOfModels[modelIndex < 0 || modelIndex > 2 ? 0 : modelIndex]
    );
  }
};

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY,
});

export const requestToGemini = async (
  context: string
): Promise<string | undefined> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error(
      'API ключ для Google Gemini не найден в переменных окружения.'
    );
    return;
  }

  try {
    const response = await ai.models.generateContent({
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
    console.error('Gemeny model answer with error:', error);
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
