
import { AppMode, ChartConfig, GroundingSource, Message } from "../types";
import { SYSTEM_INSTRUCTION, MODELS } from "../constants";

// Define Puter interface globally for TypeScript
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, ...args: any[]) => Promise<any>;
      };
    };
  }
}

interface GenerateParams {
  prompt: string;
  history?: Message[];
  imageBase64?: string; // Optional image
  mode: AppMode;
  country?: string; // Optional country for market valuation
  currency?: string; // Optional currency for valuation
}

interface ServiceResponse {
  text: string;
  chartConfig?: ChartConfig;
  groundingSources?: GroundingSource[];
}

export const generateResponse = async ({ prompt, history, imageBase64, mode, country = 'United States', currency = 'USD' }: GenerateParams): Promise<ServiceResponse> => {
  // 1. Select Model based on Mode from constants
  const modelName = MODELS[mode] || MODELS.FAST;

  // 2. Enhance system instruction based on mode
  let systemContext = SYSTEM_INSTRUCTION;
  if (mode === AppMode.RESEARCH) {
    systemContext += "\n\nYou are in RESEARCH mode. Provide up-to-date industrial standards and citations where possible. USE WEB SEARCH if needed.";
  } else if (mode === AppMode.DEEP_REASON) {
    systemContext += "\n\nYou are in DEEP REASON mode. Think step-by-step. Perform deep root cause analysis (5 Whys).";
  } else if (mode === AppMode.DATA_ANALYSIS) {
    systemContext += "\n\nYou are in DATA ANALYSIS mode. Your primary function is to convert input data into JSON visualization. MINIMIZE conversational text. If data is provided, output the JSON chart configuration immediately.";
  } else if (mode === AppMode.MARKET_VALUATION) {
    systemContext += `\n\nYou are in MARKET VALUATION mode.
    
    **CRITICAL CONFIGURATION:**
    - **TARGET MARKET:** ${country}
    - **CURRENCY:** ${currency}
    
    **PROTOCOL (STRICTLY FOLLOW):**
    1. **ANALYZE INPUT:** Does the user provide specific details (Brand, Model, Year, Condition, Hours/Mileage)?
    2. **STOP & ASK:** If the input is vague (e.g., "value this machine", "how much is this pump"), **DO NOT PROVIDE A PRICE**. Instead, list 3-4 specific technical questions needed to give an accurate valuation in ${country}.
    3. **VALUATION:** ONLY when specifications are clear, provide:
       - **Fair Market Value** in ${currency}.
       - **Liquidation Value** in ${currency}.
       - **Scrap Value** in ${currency} (using current ${country} scrap metal rates).
    4. **LOCAL CONTEXT:** You MUST reference ${country}-specific marketplaces, auction houses, or regulations. Do NOT reference US markets unless the user is in the USA.

    **NEGATIVE CONSTRAINTS:**
    - DO NOT default to USD. Use **${currency}**.
    - DO NOT guess prices without specs.
    `;
  }

  // 3. Build Conversation History Context
  let historyContext = "";
  if (history && history.length > 0) {
     historyContext = "\n\n=== CONVERSATION HISTORY (Previous context to inform your response) ===\n";
     // Limit to last 15 messages to maintain token efficiency
     const recentHistory = history.slice(-15);
     
     recentHistory.forEach(msg => {
        if (!msg.text && !msg.image) return;
        const role = msg.role === 'user' ? 'User' : 'Model';
        let content = msg.text;
        if (msg.image) {
            content = `[Image Attached] ${content}`;
        }
        historyContext += `${role}: ${content}\n`;
     });
     historyContext += "=== END HISTORY ===\n";
  }

  // 4. Construct Final Prompt
  let finalPrompt = `${systemContext}${historyContext}\n\n=== CURRENT USER INPUT ===\n${prompt}`;
  
  if (mode === AppMode.MARKET_VALUATION) {
      finalPrompt += `\n\n[SYSTEM INJECTION: MANDATORY OVERRIDE]\nTarget Country: ${country}\nOutput Currency: ${currency}\nInstruction: If specifications are missing, ask for them. If specs are present, value in ${currency} ONLY. Ignore US defaults.`;
  }

  try {
    let response: any;
    
    // Puter options object
    const options: any = { model: modelName };

    // Enable Web Search specifically for Research Mode
    if (mode === AppMode.RESEARCH) {
        options.tools = [{ type: "web_search" }];
    }

    if (imageBase64) {
      // Puter JS v2 supports (prompt, image_url, options) for vision tasks
      // Base64 string serves as the URL
      response = await window.puter.ai.chat(finalPrompt, imageBase64, options);
    } else {
      // Standard chat
      response = await window.puter.ai.chat(finalPrompt, options);
    }

    // Handle Puter JS response formats (String or Object)
    let responseText = "";
    
    if (typeof response === 'string') {
        responseText = response;
    } else if (response?.message?.content) {
        responseText = response.message.content;
    } else if (response?.text) {
        responseText = response.text;
    } else {
        responseText = JSON.stringify(response);
    }
    
    // --- Parse Chart JSON (Robust Implementation) ---
    let extractedChart: ChartConfig | undefined;
    
    const parseChartJson = (text: string): { chart: ChartConfig | undefined, cleanText: string } => {
      let chartJson: any = null;
      let cleanText = text;

      // Helper to try parsing and validating schema
      const tryParse = (str: string): any | null => {
        try {
          const obj = JSON.parse(str);
          if (obj.visualize && obj.data && Array.isArray(obj.data)) {
            return obj;
          }
        } catch (e) {
          return null;
        }
        return null;
      };

      // 1. Try finding Markdown Code Blocks (```json ... ``` or ``` ... ```)
      const codeBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
      const codeMatch = text.match(codeBlockRegex);
      
      if (codeMatch) {
        chartJson = tryParse(codeMatch[1]);
        if (chartJson) {
          cleanText = text.replace(codeMatch[0], '').trim();
          return { chart: chartJson, cleanText };
        }
      }

      // 2. Try finding raw JSON object structure
      const firstOpen = text.indexOf('{');
      const lastClose = text.lastIndexOf('}');

      if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        const potentialJson = text.substring(firstOpen, lastClose + 1);
        chartJson = tryParse(potentialJson);
        
        if (chartJson) {
            cleanText = (text.substring(0, firstOpen) + text.substring(lastClose + 1)).trim();
            return { chart: chartJson, cleanText };
        }
      }

      return { chart: undefined, cleanText: text };
    };

    const result = parseChartJson(responseText);
    extractedChart = result.chart;
    responseText = result.cleanText;

    return {
      text: responseText,
      chartConfig: extractedChart,
      groundingSources: undefined 
    };

  } catch (error: any) {
    console.error("Puter AI Error:", error);
    return {
      text: `**System Alert:** Neural Core connection interrupted.\n\nTrace: ${error.message || String(error)}`,
    };
  }
};
