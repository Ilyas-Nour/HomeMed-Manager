import api from './api';

/**
 * AI Service — Bridge to Local AI Proxy
 * Calls the backend which injects user context and handles OpenRouter communication.
 */
export const aiService = {
  /**
   * Send a message to the AI and get a response.
   * @param {Array} messages - Direct messages history [{role, content}]
   * @returns {Promise<string>} - Bot's response content
   */
  async sendMessage(messages) {
    try {
      // We call our own backend instead of OpenRouter directly
      // This is more secure and includes user context (meds, reminders, etc.)
      const response = await api.post('/ai/chat', { messages });

      // OpenRouter return structure via our proxy
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      throw new Error("L'assistant est momentanément indisponible. Veuillez réessayer plus tard.");
    }
  },
};

export default aiService;
