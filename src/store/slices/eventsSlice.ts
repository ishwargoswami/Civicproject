import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  EventListItem,
  EventDetail,
  EventCategory,
  EventStatistics,
  EventFilters,
  EventCreateData,
  RSVPData,
  VolunteerData,
  FeedbackData,
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getMyRSVPs,
  rsvpToEvent,
  updateRSVP,
  cancelRSVP,
  volunteerForEvent,
  updateVolunteerApplication,
  cancelVolunteerApplication,
  submitEventFeedback,
  getEventCategories,
  getEventStatistics,
} from '../../services/eventsApi';

interface EventsState {
  // Events lists
  events: EventListItem[];
  myEvents: EventListItem[];
  myRSVPs: EventListItem[];
  
  // Current event details
  currentEvent: EventDetail | null;
  
  // Categories and statistics
  categories: EventCategory[];
  statistics: EventStatistics | null;
  
  // Filters and pagination
  filters: EventFilters;
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  
  // Loading states
  loading: {
    events: boolean;
    currentEvent: boolean;
    myEvents: boolean;
    myRSVPs: boolean;
    categories: boolean;
    statistics: boolean;
    creating: boolean;
    updating: boolean;
    rsvp: boolean;
    volunteer: boolean;
    feedback: boolean;
  };
  
  // Error states
  error: {
    events: string | null;
    currentEvent: string | null;
    myEvents: string | null;
    myRSVPs: string | null;
    categories: string | null;
    statistics: string | null;
    creating: string | null;
    updating: string | null;
    rsvp: string | null;
    volunteer: string | null;
    feedback: string | null;
  };
}

const initialState: EventsState = {
  events: [],
  myEvents: [],
  myRSVPs: [],
  currentEvent: null,
  categories: [],
  statistics: null,
  filters: {},
  currentPage: 1,
  totalPages: 1,
  totalEvents: 0,
  loading: {
    events: false,
    currentEvent: false,
    myEvents: false,
    myRSVPs: false,
    categories: false,
    statistics: false,
    creating: false,
    updating: false,
    rsvp: false,
    volunteer: false,
    feedback: false,
  },
  error: {
    events: null,
    currentEvent: null,
    myEvents: null,
    myRSVPs: null,
    categories: null,
    statistics: null,
    creating: null,
    updating: null,
    rsvp: null,
    volunteer: null,
    feedback: null,
  },
};

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (filters?: EventFilters) => {
    const response = await getEvents(filters);
    return response;
  }
);

export const fetchEvent = createAsyncThunk(
  'events/fetchEvent',
  async (id: string) => {
    const response = await getEvent(id);
    return response;
  }
);

export const createEventAsync = createAsyncThunk(
  'events/createEvent',
  async (eventData: EventCreateData, { rejectWithValue }) => {
    try {
      const response = await createEvent(eventData);
      return response;
    } catch (error: any) {
      // Pass through the validation errors from backend
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ error: error.message || 'Failed to create event' });
    }
  }
);

export const updateEventAsync = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }: { id: string; eventData: Partial<EventCreateData> }) => {
    const response = await updateEvent(id, eventData);
    return response;
  }
);

export const deleteEventAsync = createAsyncThunk(
  'events/deleteEvent',
  async (id: string) => {
    await deleteEvent(id);
    return id;
  }
);

export const fetchMyEvents = createAsyncThunk(
  'events/fetchMyEvents',
  async () => {
    const response = await getMyEvents();
    return response;
  }
);

export const fetchMyRSVPs = createAsyncThunk(
  'events/fetchMyRSVPs',
  async () => {
    const response = await getMyRSVPs();
    return response;
  }
);

export const rsvpToEventAsync = createAsyncThunk(
  'events/rsvpToEvent',
  async ({ eventId, rsvpData }: { eventId: string; rsvpData: RSVPData }) => {
    const response = await rsvpToEvent(eventId, rsvpData);
    return response;
  }
);

export const updateRSVPAsync = createAsyncThunk(
  'events/updateRSVP',
  async ({ eventId, rsvpData }: { eventId: string; rsvpData: RSVPData }) => {
    const response = await updateRSVP(eventId, rsvpData);
    return response;
  }
);

export const cancelRSVPAsync = createAsyncThunk(
  'events/cancelRSVP',
  async (eventId: string) => {
    await cancelRSVP(eventId);
    return eventId;
  }
);

export const volunteerForEventAsync = createAsyncThunk(
  'events/volunteerForEvent',
  async ({ eventId, volunteerData }: { eventId: string; volunteerData: VolunteerData }) => {
    const response = await volunteerForEvent(eventId, volunteerData);
    return response;
  }
);

export const updateVolunteerApplicationAsync = createAsyncThunk(
  'events/updateVolunteerApplication',
  async ({ eventId, volunteerData }: { eventId: string; volunteerData: VolunteerData }) => {
    const response = await updateVolunteerApplication(eventId, volunteerData);
    return response;
  }
);

export const cancelVolunteerApplicationAsync = createAsyncThunk(
  'events/cancelVolunteerApplication',
  async (eventId: string) => {
    await cancelVolunteerApplication(eventId);
    return eventId;
  }
);

export const submitEventFeedbackAsync = createAsyncThunk(
  'events/submitEventFeedback',
  async ({ eventId, feedbackData }: { eventId: string; feedbackData: FeedbackData }) => {
    const response = await submitEventFeedback(eventId, feedbackData);
    return response;
  }
);

export const fetchEventCategories = createAsyncThunk(
  'events/fetchEventCategories',
  async () => {
    const response = await getEventCategories();
    return response;
  }
);

export const fetchEventStatistics = createAsyncThunk(
  'events/fetchEventStatistics',
  async () => {
    const response = await getEventStatistics();
    return response;
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<EventFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    clearError: (state, action: PayloadAction<keyof EventsState['error']>) => {
      state.error[action.payload] = null;
    },
    clearAllErrors: (state) => {
      Object.keys(state.error).forEach((key) => {
        state.error[key as keyof EventsState['error']] = null;
      });
    },
  },
  extraReducers: (builder) => {
    // Fetch Events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading.events = true;
        state.error.events = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading.events = false;
        state.events = action.payload;
        state.error.events = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading.events = false;
        state.error.events = action.error.message || 'Failed to fetch events';
      });

    // Fetch Event
    builder
      .addCase(fetchEvent.pending, (state) => {
        state.loading.currentEvent = true;
        state.error.currentEvent = null;
      })
      .addCase(fetchEvent.fulfilled, (state, action) => {
        state.loading.currentEvent = false;
        state.currentEvent = action.payload;
        state.error.currentEvent = null;
      })
      .addCase(fetchEvent.rejected, (state, action) => {
        state.loading.currentEvent = false;
        state.error.currentEvent = action.error.message || 'Failed to fetch event';
      });

    // Create Event
    builder
      .addCase(createEventAsync.pending, (state) => {
        state.loading.creating = true;
        state.error.creating = null;
      })
      .addCase(createEventAsync.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.events.unshift(action.payload);
        state.currentEvent = action.payload;
        state.error.creating = null;
      })
      .addCase(createEventAsync.rejected, (state, action) => {
        state.loading.creating = false;
        // Handle both regular errors and validation errors
        if (action.payload) {
          const payload = action.payload as any;
          // If it's a validation error object, format it nicely
          if (typeof payload === 'object' && !payload.error) {
            const errorMessages = Object.entries(payload)
              .map(([field, messages]) => {
                const messageArray = Array.isArray(messages) ? messages : [messages];
                return `${field}: ${messageArray.join(', ')}`;
              })
              .join('; ');
            state.error.creating = errorMessages || 'Validation failed';
          } else {
            state.error.creating = payload.error || payload.detail || 'Failed to create event';
          }
        } else {
          state.error.creating = action.error.message || 'Failed to create event';
        }
      });

    // Update Event
    builder
      .addCase(updateEventAsync.pending, (state) => {
        state.loading.updating = true;
        state.error.updating = null;
      })
      .addCase(updateEventAsync.fulfilled, (state, action) => {
        state.loading.updating = false;
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        state.currentEvent = action.payload;
        state.error.updating = null;
      })
      .addCase(updateEventAsync.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.updating = action.error.message || 'Failed to update event';
      });

    // Delete Event
    builder
      .addCase(deleteEventAsync.fulfilled, (state, action) => {
        state.events = state.events.filter(event => event.id !== action.payload);
        state.myEvents = state.myEvents.filter(event => event.id !== action.payload);
        if (state.currentEvent?.id === action.payload) {
          state.currentEvent = null;
        }
      });

    // My Events
    builder
      .addCase(fetchMyEvents.pending, (state) => {
        state.loading.myEvents = true;
        state.error.myEvents = null;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.loading.myEvents = false;
        state.myEvents = action.payload;
        state.error.myEvents = null;
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.loading.myEvents = false;
        state.error.myEvents = action.error.message || 'Failed to fetch my events';
      });

    // My RSVPs
    builder
      .addCase(fetchMyRSVPs.pending, (state) => {
        state.loading.myRSVPs = true;
        state.error.myRSVPs = null;
      })
      .addCase(fetchMyRSVPs.fulfilled, (state, action) => {
        state.loading.myRSVPs = false;
        state.myRSVPs = action.payload;
        state.error.myRSVPs = null;
      })
      .addCase(fetchMyRSVPs.rejected, (state, action) => {
        state.loading.myRSVPs = false;
        state.error.myRSVPs = action.error.message || 'Failed to fetch my RSVPs';
      });

    // RSVP Actions
    builder
      .addCase(rsvpToEventAsync.pending, (state) => {
        state.loading.rsvp = true;
        state.error.rsvp = null;
      })
      .addCase(rsvpToEventAsync.fulfilled, (state, action) => {
        state.loading.rsvp = false;
        state.currentEvent = action.payload;
        state.error.rsvp = null;
      })
      .addCase(rsvpToEventAsync.rejected, (state, action) => {
        state.loading.rsvp = false;
        state.error.rsvp = action.error.message || 'Failed to RSVP to event';
      });

    builder
      .addCase(updateRSVPAsync.fulfilled, (state, action) => {
        state.currentEvent = action.payload;
      })
      .addCase(cancelRSVPAsync.fulfilled, (state, action) => {
        if (state.currentEvent) {
          // Remove user's RSVP from current event
          state.currentEvent.user_rsvp = null;
          state.currentEvent.rsvps = state.currentEvent.rsvps.filter(
            rsvp => rsvp.id !== action.payload
          );
        }
      });

    // Volunteer Actions
    builder
      .addCase(volunteerForEventAsync.pending, (state) => {
        state.loading.volunteer = true;
        state.error.volunteer = null;
      })
      .addCase(volunteerForEventAsync.fulfilled, (state, action) => {
        state.loading.volunteer = false;
        state.currentEvent = action.payload;
        state.error.volunteer = null;
      })
      .addCase(volunteerForEventAsync.rejected, (state, action) => {
        state.loading.volunteer = false;
        state.error.volunteer = action.error.message || 'Failed to volunteer for event';
      });

    builder
      .addCase(updateVolunteerApplicationAsync.fulfilled, (state, action) => {
        state.currentEvent = action.payload;
      })
      .addCase(cancelVolunteerApplicationAsync.fulfilled, (state, action) => {
        if (state.currentEvent) {
          // Remove user's volunteer application from current event
          state.currentEvent.user_volunteer = null;
          state.currentEvent.volunteers = state.currentEvent.volunteers.filter(
            volunteer => volunteer.id !== action.payload
          );
        }
      });

    // Feedback
    builder
      .addCase(submitEventFeedbackAsync.pending, (state) => {
        state.loading.feedback = true;
        state.error.feedback = null;
      })
      .addCase(submitEventFeedbackAsync.fulfilled, (state, action) => {
        state.loading.feedback = false;
        if (state.currentEvent) {
          // Add or update feedback in current event
          const existingIndex = state.currentEvent.feedback.findIndex(
            f => f.user_name === action.payload.user_name
          );
          if (existingIndex !== -1) {
            state.currentEvent.feedback[existingIndex] = action.payload;
          } else {
            state.currentEvent.feedback.push(action.payload);
          }
        }
        state.error.feedback = null;
      })
      .addCase(submitEventFeedbackAsync.rejected, (state, action) => {
        state.loading.feedback = false;
        state.error.feedback = action.error.message || 'Failed to submit feedback';
      });

    // Categories
    builder
      .addCase(fetchEventCategories.pending, (state) => {
        state.loading.categories = true;
        state.error.categories = null;
      })
      .addCase(fetchEventCategories.fulfilled, (state, action) => {
        state.loading.categories = false;
        state.categories = action.payload;
        state.error.categories = null;
      })
      .addCase(fetchEventCategories.rejected, (state, action) => {
        state.loading.categories = false;
        state.error.categories = action.error.message || 'Failed to fetch categories';
      });

    // Statistics
    builder
      .addCase(fetchEventStatistics.pending, (state) => {
        state.loading.statistics = true;
        state.error.statistics = null;
      })
      .addCase(fetchEventStatistics.fulfilled, (state, action) => {
        state.loading.statistics = false;
        state.statistics = action.payload;
        state.error.statistics = null;
      })
      .addCase(fetchEventStatistics.rejected, (state, action) => {
        state.loading.statistics = false;
        state.error.statistics = action.error.message || 'Failed to fetch statistics';
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentPage,
  clearCurrentEvent,
  clearError,
  clearAllErrors,
} = eventsSlice.actions;

export default eventsSlice.reducer;