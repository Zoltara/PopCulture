import { GoogleGenAI, Type } from "@google/genai";
import { FavoriteItem, RecommendationResponse } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client strictly with the API key from environment variables
const ai = new GoogleGenAI({ apiKey });

export const getRecommendations = async (favorites: FavoriteItem[], excludeTitles: string[] = []): Promise<RecommendationResponse> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  if (favorites.length === 0) {
    return { recommendations: [] };
  }

  // Group favorites for the prompt
  const favoritesSummary = favorites.map(f => 
    `- [${f.category}]: ${f.title} ${f.details ? `(${f.details})` : ''}`
  ).join('\n');

  // Identify unique categories present in the user's list
  const distinctCategories = Array.from(new Set(favorites.map(f => f.category)));

  // Build prompt instructions dynamically based on categories
  const categoryInstructions = distinctCategories.map(cat => 
    `For the category "${cat}", provide exactly 3 distinct recommendations that fit the vibe.`
  ).join('\n');

  const excludeInstruction = excludeTitles.length > 0 
    ? `IMPORTANT: Do NOT recommend any of the following titles as I have already seen them: ${excludeTitles.join(', ')}.`
    : '';

  const prompt = `
    Here is a list of my favorite entertainment media:
    ${favoritesSummary}

    Based on the style, genre, tone, and vibe of these favorites, please recommend content matching the categories I have listed.

    ${categoryInstructions}

    ${excludeInstruction}

    STRICT RULES FOR REASONING:
    1. Provide a short, punchy reason why you chose it.
    2. IMPORTANT: If a recommended Book has a movie/TV adaptation, you MUST mention it in the reason (e.g., "Also a movie").
    3. IMPORTANT: If a recommended Movie/TV Series is based on a book, you MUST mention it in the reason (e.g., "Based on the book by...").
    
    STRICT RULES FOR DATA FIELDS:
    - title: The name of the work.
    - creator: 
       - If Category is "Book", this MUST be the Author's name.
       - If Category is "Music", this MUST be the Artist/Band name.
       - If Category is "Movie" or "TV Series", provide the primary Director or Showrunner name.
    
    The recommendations should fit the same "universe" or "feeling" as the collected list.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  creator: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["category", "title", "reason"],
              },
            },
          },
          required: ["recommendations"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from Gemini.");
    }

    return JSON.parse(jsonText) as RecommendationResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch recommendations. Try again!");
  }
};

export const getWorksByCreator = async (creator: string, category: string, currentTitle: string): Promise<RecommendationResponse> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const prompt = `
    I liked the ${category} "${currentTitle}" by ${creator}.
    
    Please recommend 3 OTHER popular or highly-rated works specifically by ${creator}.
    
    STRICT RULES:
    1. Do NOT include "${currentTitle}".
    2. Category must be "${category}".
    3. Creator must be "${creator}".
    4. Reason should be a brief description of the plot or style.

    STRICT OUTPUT FORMAT (JSON):
    Return an object with a "recommendations" array containing the items.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  creator: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["category", "title", "reason"],
              },
            },
          },
          required: ["recommendations"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return { recommendations: [] };
    return JSON.parse(jsonText) as RecommendationResponse;
  } catch (error) {
    console.error("Gemini Creator Lookup Error:", error);
    throw new Error(`Failed to find more works by ${creator}`);
  }
};

export const lookupMediaInfo = async (query: string, mode: 'streaming' | 'israeli', searchCurrentAiring: boolean = false, checkAllProviders: boolean = false): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let prompt = "";
  if (mode === 'streaming') {
    prompt = `You are a helpful media assistant. User is asking: Where can I stream "${query}"?
    Context: Today is ${today}.

    Instructions:
    1. List major streaming platforms (Netflix, Amazon Prime, HBO, Disney+, Hulu, Apple TV+, etc.).
    2. If it is a TV Series, provide a breakdown for EACH season.
    3. If it is a Movie, just provide the runtime.
    4. CRITICAL: If a new season or the content has a confirmed "Coming Soon" date (future date relative to today), you MUST mention it clearly.

    STRICT OUTPUT FORMAT for TV Series:
    Available on: **[Platform 1]**, **[Platform 2]**
    Total: [X] Seasons, [Y] Episodes
    Season 1: [Count] Episodes (Broadcast date of episode 1 for this season)
    Season 2: [Count] Episodes (Broadcast date of episode 1 for this season)
    ... (continue for all seasons)
    **Coming Soon:** [Date/Info] (Only if applicable)

    STRICT OUTPUT FORMAT for Movies:
    Available on: **[Platform 1]**, **[Platform 2]**
    Runtime: [Hours]h [Minutes]m
    **Coming Soon:** [Date/Info] (Only if applicable)

    Do not add extra conversational text. Just the data.`;
  } else {
    // Israeli Mode
    if (searchCurrentAiring) {
      // Generic "What's on now" search
      prompt = `List 5 popular Israeli TV series that are ACTIVELY BROADCASTING new episodes (active season) or have aired a new episode within the last 3 months.
      
      Context: Today is ${today}.
      CRITICAL RULE: Do NOT list shows that ended years ago. Only list shows active in late 2024 or 2025.

      For EACH series, follow this format STRICTLY:
      **Series Name** - [Hebrew Name] (**Channel/Provider**)
      [Total Seasons] Seasons, [Total Episodes] Episodes
      Last Aired: [Date of most recent episode]
      **Next Episode / Coming Soon:** [Date/Info] (If known)
      
      Leave a blank line between series.`;
    } else {
      // Specific series lookup
      prompt = `Provide details for the Israeli TV series "${query}". 
      Context: Today is ${today}.

      Instructions:
      1. Identify the Broadcast Channel.
      2. Provide the Hebrew Name.
      3. Identify the date of the most recently aired episode (Last Aired).
      4. Provide a breakdown for EACH season.
      5. CRITICAL: If a new season or episode has a confirmed "Coming Soon" date (future date), you MUST mention it.
      
      ${checkAllProviders ? 'CHECK ALL PROVIDERS: Check availability on Kan 11, Keshet 12, Reshet 13, HOT, YES, Partner, Cellcom.' : ''}

      STRICT OUTPUT FORMAT:
      **[Channel Name]** - [Hebrew Name]
      Total: [X] Seasons, [Y] Episodes
      Last Aired Episode: [Date]
      **Coming Soon:** [Date/Info] (Only if applicable)
      
      Season 1: [Count] Episodes (Broadcast date of episode 1 for this season)
      Season 2: [Count] Episodes (Broadcast date of episode 1 for this season)
      ... (continue for all seasons)

      If it's not an Israeli series or not found, just say "Could not find info for this Israeli series."`;
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Could not find info.";
  } catch (error) {
    console.error("Gemini Lookup Error:", error);
    throw new Error("Failed to lookup info.");
  }
};