const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.ai.apiKey || process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async explainCode(code, language) {
    const prompt = `
You are CodeVerse Assistant, an expert programming tutor. Explain the following ${language} code in a clear, concise manner.

Code:
${code}

Please provide:
1. A brief overview of what the code does
2. Explanation of key logic and flow
3. Important functions/variables and their purposes

Return your response in JSON format with this structure:
{
  "explanation": "detailed explanation here",
  "keyPoints": ["point1", "point2", "point3"],
  "complexity": "time and space complexity if applicable"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const cleanedResponse = this.cleanJSONResponse(text);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  async fixCode(code, language, error) {
    const prompt = `
You are CodeVerse Assistant. Fix the following ${language} code that has this error:

Error: ${error}

Code:
${code}

Please provide the fixed code and explanation. Return in JSON format:
{
  "fixedCode": "the corrected code here",
  "explanation": "what was wrong and how it was fixed",
  "changes": ["list of changes made"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedResponse = this.cleanJSONResponse(text);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  async optimizeCode(code, language) {
    const prompt = `
You are CodeVerse Assistant. Optimize the following ${language} code for better performance, readability, or best practices.

Code:
${code}

Provide optimized version and explanation. Return in JSON format:
{
  "optimizedCode": "the optimized code here",
  "explanation": "what optimizations were made and why",
  "improvements": ["list of specific improvements"],
  "beforeComplexity": "previous complexity",
  "afterComplexity": "new complexity"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedResponse = this.cleanJSONResponse(text);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  // New method: Convert code between languages
  async convertCode(code, sourceLanguage, targetLanguage) {
    const prompt = `
You are CodeVerse Assistant. Convert the following ${sourceLanguage} code to ${targetLanguage}:

Code:
${code}

Provide the converted code and explanation. Return in JSON format:
{
  "convertedCode": "the converted code here",
  "explanation": "key differences and considerations between the languages",
  "notes": ["important implementation notes"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedResponse = this.cleanJSONResponse(text);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  // New method: General coding chat
  async chat(message, context = '') {
    const prompt = context ? 
      `Context: ${context}\n\nUser Question: ${message}` : 
      `User Question: ${message}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        response: response.text(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  // Helper method to clean JSON responses from Gemini
  cleanJSONResponse(text) {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\s?/g, '').replace(/```\s?/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // If the response starts and ends with curly braces, it's likely JSON
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
      return cleaned;
    }
    
    // If not, try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    // If no JSON found, create a fallback response
    return JSON.stringify({
      explanation: text,
      keyPoints: [],
      complexity: "Unable to analyze complexity"
    });
  }

  // Helper method to extract code from responses
  extractCodeFromResponse(text) {
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return text;
  }
}

module.exports = AIService;