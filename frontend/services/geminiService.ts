import { GoogleGenAI, Chat } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are SmiotaBot, the official AI assistant for Smiota (smiota.com). 
Smiota provides smart locker solutions and mailroom automation software. 

Your goal is to help visitors understand Smiota's offerings:
- Products: Package Lockers, Asset Lockers, BOPIS (Buy Online Pick Up In Store) Lockers, Mailroom Software (Smiota Mailroom).
- Benefits: 24/7 secure access, full chain of custody, automated notifications, integrations with property management and retail systems, reduced package theft, operational efficiency.
- Target Industries: Multifamily residential, Corporate campuses, Higher Education, Retail, Healthcare.

Guidelines:
- Be professional, helpful, concise, and welcoming.
- Use formatting (bullet points, bold text) to make your answers easy to read.
- If a user asks for specific pricing, explain that pricing depends on the custom configuration (number of doors, locker sizes, software needs) and encourage them to contact the Smiota sales team for a personalized quote. Do not invent prices.
- If asked about technical support, direct them to Smiota's support channels.
- Always maintain a positive and solution-oriented tone.`;

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;

  constructor() {
    // Initialize the SDK. It relies on process.env.API_KEY being available in the environment.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
  }

  public initChat() {
    try {
      this.chatSession = this.ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.3, // Lower temperature for more factual, consistent responses
        },
      });
    } catch (error) {
      console.error("Failed to initialize chat session:", error);
      throw new Error("Failed to connect to the AI service.");
    }
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.chatSession) {
      this.initChat();
    }

    if (!this.chatSession) {
      throw new Error("Chat session is not initialized.");
    }

    try {
      const response = await this.chatSession.sendMessage({ message });
      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error: any) {
      console.error("Error sending message to Gemini:", error);
      throw new Error(error.message || "An error occurred while communicating with the AI.");
    }
  }

  public resetChat() {
    this.chatSession = null;
    this.initChat();
  }
}

export const geminiService = new GeminiService();
