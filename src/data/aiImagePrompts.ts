/**
 * Utility for generating commercial-safe e-commerce studio product image prompts
 * matching the prompt structure for Nano Banana 2 / Gemini image generation.
 */

export interface AiPromptParams {
  productName: string;
  typeName: string;
  colorName: string;
  fabric: string;
  fit: string;
  category: string;
}

export function buildProductAiImagePrompt(params: AiPromptParams): string {
  const { productName, typeName, colorName, fabric, fit, category } = params;

  let stylePresentation = "ghost-mannequin style, 3D invisible model form";
  if (category === 'undergarments' || category === 'kids' || typeName.toLowerCase().includes('saree')) {
    stylePresentation = "clean flat-lay studio display or ghost-mannequin presentation";
  }

  return `Professional e-commerce product photography of ${colorName} ${fabric} ${productName} (${typeName}), ${fit}. ${stylePresentation}, plain soft warm cream studio background, subtle drop shadow, even diffused studio lighting, front-facing product shot, crisp focus, catalog-ready 1:1 aspect ratio, high detail, no text, no logos, no watermark.`;
}
