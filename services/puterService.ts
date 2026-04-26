import { AppMode, ChartConfig, GroundingSource, Message } from './types';

interface GenerateParams {
  prompt: string;
  history?: Message[];
  imageBase64?: string;
  mode: AppMode;
  country?: string;
  currency?: string;
}

interface ServiceResponse {
  text: string;
  chartConfig?: ChartConfig;
  groundingSources?: GroundingSource[];
}

function buildPuterOptions(params: GenerateParams) {
  const { mode, country, currency } = params;
  const options: any = {
    model: 'gemini-3-flash-preview',
    temperature: 0.2
  };
  options.system = `MODE:${AppMode[mode] || 'STANDARD'}; Country:${country || 'United States'}; Currency:${currency || 'USD'}`;
  return options;
}

export const generateResponse = async ({ prompt, history, imageBase64, mode, country, currency }: GenerateParams): Promise<ServiceResponse> => {
  if (!(window as any).puter || !(window as any).puter.ai) {
    throw new Error('Puter not loaded');
  }

  let fullPrompt = prompt;
  if (history && history.length) {
    const hist = history.slice(-10).map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
    fullPrompt = `${hist}\n\nUser: ${prompt}`;
  }

  const options = buildPuterOptions({ prompt, history, imageBase64, mode, country, currency });

  let response: any;
  if (imageBase64) {
    response = await (window as any).puter.ai.chat(fullPrompt, imageBase64, options);
  } else {
    response = await (window as any).puter.ai.chat(fullPrompt, options);
  }

  if (typeof response === 'string') return { text: response };
  if (response && response.text) {
    return {
      text: response.text,
      chartConfig: response.chartConfig,
      groundingSources: response.groundingSources
    };
  }

  return { text: JSON.stringify(response) };
};

export async function streamResponseParts(params: GenerateParams) {
  if (!(window as any).puter || !(window as any).puter.ai) {
    throw new Error('Puter not loaded');
  }
  const { prompt, history, imageBase64, mode, country, currency } = params;
  let fullPrompt = prompt;
  if (history && history.length) {
    const hist = history.slice(-10).map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
    fullPrompt = `${hist}\n\nUser: ${prompt}`;
  }
  const options = buildPuterOptions(params);
  (options as any).stream = true;
  const it = imageBase64 ? (window as any).puter.ai.chat(fullPrompt, imageBase64, options) : (window as any).puter.ai.chat(fullPrompt, options);

  if (it && typeof (it as any)[Symbol.asyncIterator] === 'function') {
    for await (const part of it as any) {
      yield part;
    }
    return;
  }

  const single = await it;
  yield { text: single?.text || String(single) };
}
