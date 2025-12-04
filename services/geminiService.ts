
import { GoogleGenAI, Type } from "@google/genai";
import { Slide, SlideType, AspectRatio } from "../types";

// Initialize the client with API key from localStorage or env
const getStoredApiKey = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key') || process.env.API_KEY || '';
  }
  return process.env.API_KEY || '';
};

let ai = new GoogleGenAI({ apiKey: getStoredApiKey() });

// Function to update the API key at runtime
export const setApiKey = (apiKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gemini_api_key', apiKey);
  }
  ai = new GoogleGenAI({ apiKey });
};

// Function to get current API key (masked)
export const getApiKeyMasked = (): string => {
  const key = getStoredApiKey();
  if (!key) return '';
  if (key.length <= 8) return '****';
  return key.substring(0, 4) + '****' + key.substring(key.length - 4);
};

// Function to check if API key is set
export const hasApiKey = (): boolean => {
  return !!getStoredApiKey();
};

// Models
export const TEXT_MODEL_PRO = "gemini-3-pro-preview";
export const TEXT_MODEL_PRO_2_5 = "gemini-2.5-pro-preview-02-05";
export const TEXT_MODEL_FLASH = "gemini-2.5-flash";

export const IMAGE_MODEL_PRO = "gemini-3-pro-image-preview"; // Nano Banana Pro
export const IMAGE_MODEL_FLASH = "gemini-2.5-flash-image";   // Nano Banana (Fallback)

// Helper function for API aspect ratio format
// Nano Banana Pro supports: "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"
const getApiAspectRatio = (ratio: AspectRatio): string => {
  const mapping: Record<AspectRatio, string> = {
    '1/1': '1:1',
    '4/5': '4:5',
    '9/16': '9:16',
    '16/9': '16:9'
  };
  return mapping[ratio] || '1:1';
};

interface GeneratedSlideSchema {
  type: string;
  content: string;
  suggestedImagePrompt: string;
  needsImage: boolean;
}

/**
 * Generates the carousel text structure using Gemini
 * Supports model selection and fallback from Pro to 2.5 Pro to Flash
 */
export const generateCarouselContent = async (topic: string, count: number = 7, modelName: string = TEXT_MODEL_PRO): Promise<Slide[]> => {
  const prompt = `
      Act as a viral social media expert. Create an Instagram Carousel in the style of a "Twitter Thread" about the following topic: "${topic}".
      
      Requirements:
      1. Create exactly ${count} slides.
      2. Slide 1 must be a strong Hook (Type: COVER). Use Markdown for emphasis (e.g. # Header, **bold**).
      3. Slides 2-${count - 1} should be the educational content (Type: CONTENT). Keep text concise, punchy, like a tweet. Use bullet points if needed.
      4. Slide ${count} must be a Call to Action (Type: CTA).
      5. Determine if a slide needs an image to be engaging (needsImage).
      6. Provide a 'suggestedImagePrompt' for image generation later. If no image is needed, return an empty string.
      
      Return strictly JSON.
    `;

  const generate = async (m: string) => {
      const response = await ai.models.generateContent({
        model: m,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              slides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    content: { type: Type.STRING },
                    needsImage: { type: Type.BOOLEAN },
                    suggestedImagePrompt: { type: Type.STRING }
                  },
                  required: ["type", "content", "needsImage", "suggestedImagePrompt"]
                }
              }
            }
          }
        }
      });
      return response;
  };

  const parseResponse = (response: any) => {
      const json = JSON.parse(response.text || "{}");
      const rawSlides = (json.slides || []) as GeneratedSlideSchema[];

      // Map to our app's Slide interface
      return rawSlides.map((s, index) => ({
        id: crypto.randomUUID(),
        type: (s.type as SlideType) || SlideType.CONTENT,
        content: s.content,
        showImage: s.needsImage,
        imagePrompt: s.suggestedImagePrompt,
        imageUrl: s.needsImage ? undefined : undefined, // Images generated separately
        imageScale: 50, // Default 50% height
        overlayImage: true // Default to overlay for Storyteller mode if used
      }));
  };

  try {
    const response = await generate(modelName);
    return parseResponse(response);
  } catch (error) {
    console.warn(`Error generating carousel content with ${modelName}:`, error);
    
    // Recursive Fallback Chain: Pro 3 -> Pro 2.5 -> Flash
    let fallbackModel: string | null = null;

    if (modelName === TEXT_MODEL_PRO) {
        fallbackModel = TEXT_MODEL_PRO_2_5;
    } else if (modelName === TEXT_MODEL_PRO_2_5) {
        fallbackModel = TEXT_MODEL_FLASH;
    }

    if (fallbackModel) {
        console.log(`Attempting fallback to ${fallbackModel}...`);
        try {
            return await generateCarouselContent(topic, count, fallbackModel);
        } catch (fallbackError) {
            // The recursive call will handle its own logging, but if it bubbles up:
            console.error(`Fallback chain failed at ${fallbackModel}:`, fallbackError);
            throw fallbackError;
        }
    }
    
    // If no fallback model defined (e.g. we failed on Flash), throw original error
    throw error;
  }
};

/**
 * Generates an image for a specific slide
 * Allows model selection and includes fallback logic for permissions
 */
export const generateSlideImage = async (prompt: string, aspectRatio: AspectRatio, modelName: string = IMAGE_MODEL_PRO): Promise<string> => {
  const apiAspectRatio = getApiAspectRatio(aspectRatio);

  const generate = async (m: string) => {
      const isPro = m === IMAGE_MODEL_PRO;
      const response = await ai.models.generateContent({
        model: m,
        contents: {
          parts: [{ text: `Minimalist, high quality, photorealistic, cinematic lighting. ${prompt}` }]
        },
        config: {
          imageConfig: {
            aspectRatio: apiAspectRatio,
            // imageSize is only supported by the Pro image model
            ...(isPro ? { imageSize: "2K" } : {})
          }
        }
      });
      return response;
  }

  try {
    const response = await generate(modelName);
    return extractImage(response);
  } catch (error: any) {
    // Check if error is permission related (403) or not found (404)
    // Only attempt fallback if we started with PRO and it failed, and haven't already tried FLASH
    if (modelName === IMAGE_MODEL_PRO && (error?.status === 'PERMISSION_DENIED' || error?.status === 403 || error.message?.includes('403'))) {
       console.warn(`Falling back to ${IMAGE_MODEL_FLASH} due to permission error on ${IMAGE_MODEL_PRO}`);
       try {
           const response = await generate(IMAGE_MODEL_FLASH);
           return extractImage(response);
       } catch (fallbackError) {
           console.error("Fallback image generation also failed:", fallbackError);
           throw fallbackError;
       }
    }
    console.error("Error generating image:", error);
    throw error;
  }
};

const extractImage = (response: any): string => {
   for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from API");
}

/**
 * Stylizes an uploaded image using Gemini's image-to-image capability
 * @param imageBase64 - The base64 encoded image data (without data URI prefix)
 * @param mimeType - The MIME type of the image (e.g., "image/png", "image/jpeg")
 * @param stylePrompt - The stylization prompt describing desired transformation
 * @param apiAspectRatio - The API aspect ratio string (e.g., "1:1", "9:16") - allows preserving original image ratio
 * @param modelName - The model to use (defaults to IMAGE_MODEL_PRO)
 */
export const stylizeImage = async (
  imageBase64: string,
  mimeType: string,
  stylePrompt: string,
  apiAspectRatio: string,
  modelName: string = IMAGE_MODEL_PRO
): Promise<string> => {

  const generate = async (m: string) => {
    const isPro = m === IMAGE_MODEL_PRO;
    const response = await ai.models.generateContent({
      model: m,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64
            }
          },
          {
            text: `Transform this image with the following style: ${stylePrompt}. Maintain the core subject matter but apply the artistic transformation.`
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: apiAspectRatio,
          ...(isPro ? { imageSize: "2K" } : {})
        }
      }
    });
    return response;
  };

  try {
    const response = await generate(modelName);
    return extractImage(response);
  } catch (error: any) {
    if (modelName === IMAGE_MODEL_PRO && (error?.status === 'PERMISSION_DENIED' || error?.status === 403 || error.message?.includes('403'))) {
      console.warn(`Falling back to ${IMAGE_MODEL_FLASH} for stylization`);
      try {
        const response = await generate(IMAGE_MODEL_FLASH);
        return extractImage(response);
      } catch (fallbackError) {
        console.error("Fallback stylization also failed:", fallbackError);
        throw fallbackError;
      }
    }
    console.error("Error stylizing image:", error);
    throw error;
  }
};
