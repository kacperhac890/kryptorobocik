
import { GoogleGenAI, Type } from "@google/genai";
import { ScalpAnalysis, SignalType, VolatilityReport, TradingStyle } from "../types";

const MODEL_NAME_ANALYSIS = 'gemini-3-flash-preview';
const MODEL_NAME_SEARCH = 'gemini-3-pro-preview';

const SYSTEM_INSTRUCTION_BASE = `
  Jesteś NIEOMYLNYM RDZENIEM TRADINGOWYM (BINGX QUANT CORE v5.0 Tactical). 
  TWOIM ZADANIEM JEST WYDAWANIE PRECYZYJNYCH ROZKAZÓW BOJOWYCH.
  
  MANDATORY EXECUTION RULES:
  1. ACTION COMMAND: Musisz jasno określić typ egzekucji: 'IMMEDIATE' (jeśli cena jest w strefie) lub 'LIMIT' (jeśli trzeba czekać).
  2. INSTRUCTION: Napisz WIELKIMI LITERAMI co ma zrobić użytkownik, np. "KUP TERAZ (MARKET)" lub "CZEKAJ NA POZIOM 45,230".
  3. RISK MANAGEMENT (SPECIFIC PARAMETERS): 
     - LEVERAGE: Dźwignia MUSI mieścić się w zakresie 20x - 50x.
       * Styl CONSERVATIVE: celuj w 20x - 30x.
       * Styl AGGRESSIVE: celuj w 35x - 50x.
     - POSITION SIZING: Procent kapitału na pozycję MUSI mieścić się w zakresie 15% - 65%.
       * Styl CONSERVATIVE: celuj w 15% - 30% kapitału.
       * Styl AGGRESSIVE: celuj w 35% - 65% kapitału.
  4. ADVICE: Porównaj styl agresywny i bezpieczny dla danego setupu i powiedz, co Ty byś wybrał jako AI.
  5. REAL-TIME: Użyj Google Search do weryfikacji aktualnej ceny przed wydaniem rozkazu.
`;

const SCALP_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    signal: { type: Type.STRING },
    entryPrice: { type: Type.STRING },
    takeProfit: { type: Type.STRING },
    takeProfitSafe: { type: Type.STRING },
    stopLoss: { type: Type.STRING },
    riskRewardRatio: { type: Type.STRING },
    reasoning: { type: Type.ARRAY, items: { type: Type.STRING } },
    timeframe: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    marketStructure: { type: Type.STRING },
    keyLiquidityZones: { type: Type.ARRAY, items: { type: Type.STRING } },
    fvgDetected: { type: Type.BOOLEAN },
    volatilityIndex: { type: Type.STRING },
    indicators: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.STRING },
          sentiment: { type: Type.STRING }
        },
        required: ["label", "value", "sentiment"]
      }
    },
    patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
    liquidityNarrative: { type: Type.STRING },
    socialSentiment: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        volumeSpike: { type: Type.BOOLEAN },
        topNarrative: { type: Type.STRING },
        platforms: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              activity: { type: Type.STRING },
              trend: { type: Type.STRING }
            },
            required: ["name", "activity", "trend"]
          }
        }
      },
      required: ["score", "volumeSpike", "topNarrative", "platforms"]
    },
    executionType: { type: Type.STRING },
    actionInstruction: { type: Type.STRING },
    recommendedLeverage: { type: Type.STRING },
    positionSizing: { type: Type.STRING },
    systemRiskAdvice: { type: Type.STRING },
    tradeWarning: { type: Type.STRING }
  },
  required: [
    "signal", "entryPrice", "takeProfit", "takeProfitSafe", "stopLoss", 
    "riskRewardRatio", "reasoning", "timeframe", "confidence", 
    "marketStructure", "keyLiquidityZones", "fvgDetected", "volatilityIndex", 
    "indicators", "patterns", "liquidityNarrative", "socialSentiment",
    "executionType", "actionInstruction", "recommendedLeverage", "positionSizing", "systemRiskAdvice", "tradeWarning"
  ]
};

export const analyzeChart = async (base64Image: string, style: TradingStyle = 'CONSERVATIVE'): Promise<ScalpAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `DOKONAJ NIEOMYLNEJ ANALIZY SMC. Użytkownik wybrał styl gry: ${style}. 
  Wydaj konkretny ROZKAZ BOJOWY. 
  PAMIĘTAJ O RYGORYSTYCZNYCH PARAMETRACH:
  1. Dźwignia: 20x-50x (dla ${style} dopasuj wewnątrz tego zakresu).
  2. Kapitał na pozycję: 15% - 65% (dla ${style} dopasuj wewnątrz tego zakresu).
  Podaj konkretne wartości.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME_ANALYSIS,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } },
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: SCALP_ANALYSIS_SCHEMA as any
    }
  });

  const text = response.text;
  if (!text) throw new Error("SYSTEM_CRITICAL: Engine failure.");
  try {
    const data = JSON.parse(text);
    return { ...data, signal: data.signal.toUpperCase() as SignalType };
  } catch (e) {
    throw new Error("SYSTEM_CRITICAL: Analysis corrupted.");
  }
};

export const analyzeChartFromLink = async (url: string, style: TradingStyle = 'CONSERVATIVE'): Promise<ScalpAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `DOKONAJ NIEOMYLNEJ ANALIZY SMC DLA LINKU: ${url}. 
  Styl gry użytkownika: ${style}. 
  PARAMETRY: Dźwignia 20x-50x, Kapitał 15%-65%. Obowiązkowe.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME_SEARCH,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: SCALP_ANALYSIS_SCHEMA as any
    }
  });

  const text = response.text;
  if (!text) throw new Error("SYSTEM_CRITICAL: Engine failure.");
  try {
    const data = JSON.parse(text);
    return { ...data, signal: data.signal.toUpperCase() as SignalType };
  } catch (e) {
    throw new Error("SYSTEM_CRITICAL: Analysis corrupted.");
  }
};

export const findVolatilityOpportunities = async (rawData?: string, mode: 'GENERAL' | 'MEME' = 'GENERAL'): Promise<VolatilityReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `COMMAND: Wykonaj skan BINGX pod kątem setupów 1500%. LIVE PRICE MANDATORY.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME_SEARCH,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING },
          marketContext: {
            type: Type.OBJECT,
            properties: { btcDominance: { type: Type.STRING }, marketPhase: { type: Type.STRING }, topNarrative: { type: Type.STRING }, globalSentiment: { type: Type.STRING } },
            required: ["btcDominance", "marketPhase", "topNarrative", "globalSentiment"]
          },
          opportunities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ticker: { type: Type.STRING },
                signal: { type: Type.STRING },
                setup: { type: Type.STRING },
                currentPrice: { type: Type.STRING },
                justification: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                targetPrice: { type: Type.STRING },
                targetPriceSafe: { type: Type.STRING },
                stopLoss: { type: Type.STRING },
                estimatedMove: { type: Type.STRING },
                lastUpdated: { type: Type.STRING },
                socialSentiment: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, mentionSpike: { type: Type.BOOLEAN }, trendingPlatform: { type: Type.STRING } }, required: ["score", "mentionSpike", "trendingPlatform"] },
                onChainData: { type: Type.OBJECT, properties: { whaleActivity: { type: Type.STRING }, exchangeFlow: { type: Type.STRING } }, required: ["whaleActivity", "exchangeFlow"] },
                liquidityStatus: { type: Type.STRING },
                narrative: { type: Type.STRING },
                securityScore: { type: Type.NUMBER },
                isSafeContract: { type: Type.BOOLEAN },
                macroAlignment: { type: Type.STRING },
                institutionalInterest: { type: Type.STRING }
              },
              required: ["ticker", "signal", "setup", "currentPrice", "targetPrice", "targetPriceSafe", "stopLoss", "lastUpdated", "socialSentiment", "onChainData", "securityScore", "isSafeContract", "macroAlignment", "institutionalInterest"]
            }
          }
        },
        required: ["status", "marketContext", "opportunities"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("SCANNER_FAILURE: Null response.");
  try {
    const data = JSON.parse(text);
    const opportunities = (data.opportunities || []).slice(0, 3).map((op: any) => ({ ...op, signal: op.signal?.toUpperCase() as SignalType }));
    return { ...data, status: opportunities.length > 0 ? 'ACTIVE' : 'LOW_VOLATILITY', opportunities, timestamp: Date.now() };
  } catch (e) {
    throw new Error("SCANNER_FAILURE: Data parsing error.");
  }
};
