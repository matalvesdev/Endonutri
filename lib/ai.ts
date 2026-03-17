import { GoogleGenAI, Type } from "@google/genai";

export async function generateMealPlanAndGroceryList(
  symptoms: string[],
  restrictions: string[],
  goals: string[]
) {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
  
  const prompt = `
    You are an expert nutritionist specializing in endometriosis.
    Generate a weekly anti-inflammatory meal plan and a categorized grocery shopping list for a woman with endometriosis.
    
    User Profile:
    - Symptoms: ${symptoms.join(", ") || "None specified"}
    - Dietary Restrictions: ${restrictions.join(", ") || "None specified"}
    - Goals: ${goals.join(", ") || "Manage endometriosis symptoms"}
    
    Rules:
    - Focus on an anti-inflammatory diet.
    - Avoid processed foods.
    - Ensure balanced nutrition.
    - Provide 3 meals (Breakfast, Lunch, Dinner) and 1 Snack per day for 7 days.
    - The grocery list must be categorized (e.g., Produce, Proteins, Pantry, Dairy/Alternatives).
    - ALL output MUST be in Portuguese (pt-BR).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mealPlan: {
            type: Type.ARRAY,
            description: "7-day meal plan",
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, description: "Day of the week (e.g., Monday)" },
                breakfast: { type: Type.STRING },
                lunch: { type: Type.STRING },
                dinner: { type: Type.STRING },
                snack: { type: Type.STRING }
              },
              required: ["day", "breakfast", "lunch", "dinner", "snack"]
            }
          },
          groceryList: {
            type: Type.ARRAY,
            description: "Categorized grocery list",
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: "Category (e.g., Produce)" },
                items: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["category", "items"]
            }
          }
        },
        required: ["mealPlan", "groceryList"]
      }
    }
  });

  let text = response.text;
  if (!text) throw new Error("Failed to generate content");
  
  // Strip markdown formatting if present
  text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON from AI response. Raw text:", text);
    throw new Error("Invalid JSON response from AI");
  }
}

export async function analyzeFoodImage(
  base64Image: string,
  mimeType: string,
  profile: any
) {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

  let profileContext = '';
  if (profile) {
    profileContext = `
    User Profile:
    - Symptoms: ${profile.symptoms?.join(", ") || "None specified"}
    - Dietary Restrictions: ${profile.restrictions?.join(", ") || "None specified"}
    - Goals: ${profile.goals?.join(", ") || "Manage endometriosis symptoms"}
    `;
  }

  const prompt = `
    You are an expert nutritionist specializing in endometriosis.
    The user has sent a photo of a food item or meal.
    ${profileContext}
    
    Analyze the image and provide:
    1. Identification of the food/meal.
    2. Nutritional evaluation focusing on endometriosis (is it inflammatory or anti-inflammatory?).
    3. Tips on how to include this in their routine or suggestions for healthier substitutions if necessary.
    
    Respond in Portuguese in a warm, clear, and encouraging tone. Use simple markdown formatting (use * for bold, and - for bullet points). Do not use asterisks for bullet points.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt }
      ]
    }
  });

  return response.text;
}
