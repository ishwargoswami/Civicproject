/**
 * Chatbot API Service
 */
import api from './api';

export interface ChatSession {
  session_id: string;
  message: string;
  welcome_message: ChatMessageResponse;
}

export interface ChatMessageResponse {
  id: number;
  message: string;
  sender: 'user' | 'bot' | 'system';
  intent?: string;
  confidence?: number;
  response_time_ms?: number;
  quick_replies?: QuickReply[];
  created_at: string;
}

export interface QuickReply {
  text: string;
  action: string;
  url?: string;
}

export interface SendMessageResponse {
  user_message: ChatMessageResponse;
  bot_response: ChatMessageResponse;
}

export interface ChatHistory {
  session_id: string;
  started_at: string;
  messages: ChatMessageResponse[];
}

export interface CommonQuestionsResponse {
  categories: [string, string][];
  questions: Record<string, CommonQuestion[]>;
}

export interface CommonQuestion {
  id: number;
  category: string;
  question: string;
  answer: string;
  times_asked: number;
  helpful_count: number;
}

const chatbotService = {
  /**
   * Start a new chat session
   */
  async startSession(): Promise<ChatSession> {
    const response = await api.post('/chatbot/session/start/');
    return response.data;
  },

  /**
   * Send a message
   */
  async sendMessage(sessionId: string, message: string): Promise<SendMessageResponse> {
    const response = await api.post('/chatbot/message/send/', {
      session_id: sessionId,
      message,
    });
    return response.data;
  },

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string): Promise<ChatHistory> {
    const response = await api.get(`/chatbot/session/${sessionId}/history/`);
    return response.data;
  },

  /**
   * Rate a bot message
   */
  async rateMessage(
    messageId: number,
    rating: 1 | 2 | 3 | 4 | 5,
    helpful: boolean = true,
    comment: string = ''
  ): Promise<void> {
    await api.post('/chatbot/message/rate/', {
      message_id: messageId,
      rating,
      helpful,
      comment,
    });
  },

  /**
   * End chat session
   */
  async endSession(sessionId: string): Promise<void> {
    await api.post('/chatbot/session/end/', {
      session_id: sessionId,
    });
  },

  /**
   * Get common questions (FAQ)
   */
  async getCommonQuestions(category: string = 'all'): Promise<CommonQuestionsResponse> {
    const response = await api.get('/chatbot/questions/', {
      params: { category },
    });
    return response.data;
  },

  /**
   * Ask a common question by ID
   */
  async askCommonQuestion(questionId: number): Promise<CommonQuestion> {
    const response = await api.post('/chatbot/questions/ask/', {
      question_id: questionId,
    });
    return response.data;
  },

  /**
   * Get my chat sessions
   */
  async getMySessions(): Promise<any> {
    const response = await api.get('/chatbot/sessions/mine/');
    return response.data;
  },
};

export default chatbotService;

