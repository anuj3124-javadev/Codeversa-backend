const { Mistral } = require('@mistralai/mistralai');
const config = require('../config/env');

class AIService {
  constructor() {
    // Initialize Mistral client
    this.client = new Mistral({
      apiKey: config.ai.mistralKey || process.env.MISTRAL_API_KEY,
    });
    this.model = config.ai.mistralModel || 'mistral-medium';
  }

  // Helper to create a chat completion with a system prompt and user message
  async createChatCompletion(systemPrompt, userMessage) {
    try {
      const response = await this.client.chat.complete({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.2, // Lower temperature for more deterministic JSON output
        responseFormat: { type: "json_object" } // Request JSON output (Mistral supports this)
      });

      const content = response.choices[0].message.content;
      return content;
    } catch (error) {
      throw new Error(`Mistral AI error: ${error.message}`);
    }
  }

  async explainCode(code, language) {
    const systemPrompt = `You are CodeVerse Assistant, an expert programming tutor. You always respond in valid JSON.`;
    const userMessage = `
Explain the following ${language} code in a clear, concise manner.

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
      const text = await this.createChatCompletion(systemPrompt, userMessage);
      const cleaned = this.cleanJSONResponse(text);
      return JSON.parse(cleaned);
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  async fixCode(code, language, error) {
    const systemPrompt = `You are CodeVerse Assistant. You always respond in valid JSON.`;
    const userMessage = `
Fix the following ${language} code that has this error:

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
      const text = await this.createChatCompletion(systemPrompt, userMessage);
      const cleaned = this.cleanJSONResponse(text);
      return JSON.parse(cleaned);
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  async optimizeCode(code, language) {
    const systemPrompt = `You are CodeVerse Assistant. You always respond in valid JSON.`;
    const userMessage = `
Optimize the following ${language} code for better performance, readability, or best practices.

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
      const text = await this.createChatCompletion(systemPrompt, userMessage);
      const cleaned = this.cleanJSONResponse(text);
      return JSON.parse(cleaned);
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  async convertCode(code, sourceLanguage, targetLanguage) {
    const systemPrompt = `You are CodeVerse Assistant. You always respond in valid JSON.`;
    const userMessage = `
Convert the following ${sourceLanguage} code to ${targetLanguage}:

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
      const text = await this.createChatCompletion(systemPrompt, userMessage);
      const cleaned = this.cleanJSONResponse(text);
      return JSON.parse(cleaned);
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  async chat(message, context = '') {
    const systemPrompt = context
      ? `You are CodeVerse Assistant, a helpful coding expert. Use the following context to answer the user's question:\n\n${context}`
      : `You are CodeVerse Assistant, a helpful coding expert.`;

    try {
      const response = await this.client.chat.complete({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.5
      });

      return {
        response: response.choices[0].message.content,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  // Helper method to clean JSON responses
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
}

module.exports = AIService;