require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sharp = require('sharp');

const genAI = new GoogleGenerativeAI(process.env.API_KEY );

async function processImageWithGemini(imagePath, prompt) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    const outputDir = path.join(__dirname, '../public/output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputImagePath = path.join(outputDir, `edited_${path.basename(imagePath)}`);
    
    // First get analysis from Gemini about the image
    const analysis = await analyzeImageWithGemini(imageBase64, prompt);
    
    // Then apply simulated editing effects based on the prompt
    await applyEditEffects(imageBuffer, outputImagePath, prompt, analysis);
    
    return outputImagePath;
  } catch (error) {
    console.error('Error in Gemini service:', error);
    throw new Error('Failed to process image with Gemini API');
  }
}

async function analyzeImageWithGemini(imageBase64, prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    // Prepare image for Gemini
    const imageData = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };
    
    // Create prompt for Gemini
    const analysisPrompt = `Analyze this image and give me a brief description of how it could be edited based on this request: "${prompt}". Keep your response under 100 words.`;
    
    // Get response from Gemini
    const result = await model.generateContent([analysisPrompt, imageData]);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    return 'Unable to analyze the image';
  }
}

async function applyEditEffects(imageBuffer, outputPath, prompt, analysis) {
  try {
    // Parse the prompt to determine what kind of edit to apply
    const promptLower = prompt.toLowerCase();
    
    // Start with base image processing
    let imageProcessor = sharp(imageBuffer).resize(800);
    
    // Apply different effects based on the prompt
    if (promptLower.includes('dark') || promptLower.includes('darker')) {
      imageProcessor = imageProcessor.modulate({ brightness: 0.7 });
    } else if (promptLower.includes('bright') || promptLower.includes('brighter')) {
      imageProcessor = imageProcessor.modulate({ brightness: 1.3 });
    }
    
    if (promptLower.includes('contrast')) {
      imageProcessor = imageProcessor.modulate({ contrast: 1.3 });
    }
    
    if (promptLower.includes('saturate') || promptLower.includes('vibrant')) {
      imageProcessor = imageProcessor.modulate({ saturation: 1.5 });
    } else if (promptLower.includes('desaturate') || promptLower.includes('grayscale') || promptLower.includes('black and white')) {
      imageProcessor = imageProcessor.grayscale();
    }
    
    if (promptLower.includes('blur')) {
      imageProcessor = imageProcessor.blur(5);
    }
    
    if (promptLower.includes('sharpen')) {
      imageProcessor = imageProcessor.sharpen();
    }
    
    // Add watermark with Gemini analysis
    imageProcessor = imageProcessor.composite([{
      input: {
        text: {
          text: `AI Edit: ${analysis.substring(0, 50)}...`,
          font: 'sans',
          fontSize: 24,
          rgba: true
        }
      },
      gravity: 'southeast'
    }]);
    
    await imageProcessor.toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error('Error applying edit effects:', error);
    throw error;
  }
}

module.exports = {
  processImageWithGemini
};