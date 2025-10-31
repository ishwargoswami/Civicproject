/**
 * Redux slice for chatbot state
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import chatbotService, {
  ChatSession,
  ChatMessageResponse,
  SendMessageResponse,
} from '../../services/chatbot';

export interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  sessionId: string | null;
  messages: ChatMessageResponse[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: ChatState = {
  isOpen: false,
  isMinimized: false,
  sessionId: localStorage.getItem('chat_session_id') || null,
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,
  unreadCount: 0,
};

/**
 * Start new chat session
 */
export const startChatSession = createAsyncThunk(
  'chatbot/startSession',
  async (_, { rejectWithValue }) => {
    try {
      const data = await chatbotService.startSession();
      // Store session ID in localStorage
      localStorage.setItem('chat_session_id', data.session_id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to start chat session');
    }
  }
);

/**
 * Send message
 */
export const sendChatMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async (
    { sessionId, message }: { sessionId: string; message: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await chatbotService.sendMessage(sessionId, message);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send message');
    }
  }
);

/**
 * Load chat history
 */
export const loadChatHistory = createAsyncThunk(
  'chatbot/loadHistory',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const data = await chatbotService.getChatHistory(sessionId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to load chat history');
    }
  }
);

/**
 * End chat session
 */
export const endChatSession = createAsyncThunk(
  'chatbot/endSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      await chatbotService.endSession(sessionId);
      localStorage.removeItem('chat_session_id');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to end session');
    }
  }
);

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    openChat: (state) => {
      state.isOpen = true;
      state.isMinimized = false;
      state.unreadCount = 0;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    minimizeChat: (state) => {
      state.isMinimized = true;
    },
    maximizeChat: (state) => {
      state.isMinimized = false;
    },
    toggleChat: (state) => {
      if (state.isOpen && !state.isMinimized) {
        state.isMinimized = true;
      } else {
        state.isOpen = true;
        state.isMinimized = false;
        state.unreadCount = 0;
      }
    },
    incrementUnread: (state) => {
      if (!state.isOpen || state.isMinimized) {
        state.unreadCount += 1;
      }
    },
    resetChat: (state) => {
      state.sessionId = null;
      state.messages = [];
      state.error = null;
      localStorage.removeItem('chat_session_id');
    },
  },
  extraReducers: (builder) => {
    // Start session
    builder
      .addCase(startChatSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startChatSession.fulfilled, (state, action: PayloadAction<ChatSession>) => {
        state.isLoading = false;
        state.sessionId = action.payload.session_id;
        state.messages = [action.payload.welcome_message];
        state.isOpen = true;
      })
      .addCase(startChatSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Send message
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isTyping = true;
        state.error = null;
      })
      .addCase(
        sendChatMessage.fulfilled,
        (state, action: PayloadAction<SendMessageResponse>) => {
          state.isTyping = false;
          state.messages.push(action.payload.user_message);
          state.messages.push(action.payload.bot_response);
          
          // Increment unread if chat is closed or minimized
          if (!state.isOpen || state.isMinimized) {
            state.unreadCount += 1;
          }
        }
      )
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.payload as string;
      });

    // Load history
    builder
      .addCase(loadChatHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadChatHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
      })
      .addCase(loadChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // End session
    builder
      .addCase(endChatSession.fulfilled, (state) => {
        state.sessionId = null;
        state.messages = [];
        state.isOpen = false;
      });
  },
});

export const {
  openChat,
  closeChat,
  minimizeChat,
  maximizeChat,
  toggleChat,
  incrementUnread,
  resetChat,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;

