import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect
} from 'react';

interface Meeting {
  id: string;
  title: string;
  date: Date;
  participants: number;
  type: 'service' | 'study' | 'prayer' | 'meeting';
  description?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number; // every X days/weeks/months
    daysOfWeek?: number[]; // for weekly: 0=Sunday, 1=Monday, etc.
    endDate?: Date;
    occurrences?: number; // number of occurrences
  };
  recurringSeriesId?: string; // links recurring meetings together
  originalDate?: Date; // for recurring meetings, the original start date
}


interface SharedVerse {
  id: string;
  reference: string;
  text: string;
  translation: string;
  sharedBy: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  sender: string;
  recipient?: string;
  text: string;
  timestamp: Date;
  recipientId: string | null;
}

interface AppState {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  isInMeeting: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  participants: { id: string; name: string; isMuted: boolean; isVideoOn: boolean }[];
  sharedVerse: SharedVerse | null;
  isVerseSharing: boolean;
  messages: ChatMessage[];
}

type AppAction =
  | { type: 'JOIN_MEETING'; payload: Meeting }
  | { type: 'LEAVE_MEETING' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_VIDEO' }
  | { type: 'TOGGLE_SCREEN_SHARE' }
  | { type: 'ADD_MEETING'; payload: Meeting }
  | { type: 'SHARE_VERSE'; payload: SharedVerse }
  | { type: 'STOP_VERSE_SHARING' }
  | { type: 'SEND_MESSAGE'; payload: ChatMessage }
  | { type: 'RECEIVE_MESSAGE'; payload: ChatMessage };

const initialState: AppState = {
  meetings: [
    {
      id: '1',
      title: 'Sunday Morning Service',
      date: new Date(2024, 11, 15, 10, 0),
      participants: 45,
      type: 'service',
      description: 'Weekly worship service with communion',
      isRecurring: true,
      recurringPattern: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [0] // Sunday
      },
      recurringSeriesId: 'sunday-service',
      originalDate: new Date(2024, 11, 15, 10, 0)
    },
    {
      id: '2',
      title: 'Wednesday Bible Study',
      date: new Date(2024, 11, 18, 19, 0),
      participants: 12,
      type: 'study',
      description: 'Deep dive into the Gospel of John',
      isRecurring: true,
      recurringPattern: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [3] // Wednesday
      },
      recurringSeriesId: 'wednesday-study',
      originalDate: new Date(2024, 11, 18, 19, 0)
    }
  ],
  currentMeeting: null,
  isInMeeting: false,
  isMuted: false,
  isVideoOn: true,
  isScreenSharing: false,
  participants: [],
  sharedVerse: null,
  isVerseSharing: false,
  messages: []
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'JOIN_MEETING':
      return {
        ...state,
        currentMeeting: action.payload,
        isInMeeting: true,
        participants: [
          { id: '1', name: 'You', isMuted: false, isVideoOn: true },
          { id: '2', name: 'Pastor Mike', isMuted: false, isVideoOn: true },
          { id: '3', name: 'Sarah Johnson', isMuted: true, isVideoOn: true },
          { id: '4', name: 'David Wilson', isMuted: false, isVideoOn: false }
        ]
      };
    case 'LEAVE_MEETING':
      return {
        ...state,
        currentMeeting: null,
        isInMeeting: false,
        participants: [],
        sharedVerse: null,
        isVerseSharing: false
      };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'TOGGLE_VIDEO':
      return { ...state, isVideoOn: !state.isVideoOn };
    case 'TOGGLE_SCREEN_SHARE':
      return { 
        ...state, 
        isScreenSharing: !state.isScreenSharing,
        // Stop verse sharing when screen sharing starts
        isVerseSharing: state.isScreenSharing ? state.isVerseSharing : false,
        sharedVerse: state.isScreenSharing ? state.sharedVerse : null
      };
    case 'ADD_MEETING':
      return {
        ...state,
        meetings: [...state.meetings, action.payload]
      };
    case 'SHARE_VERSE':
      return {
        ...state,
        sharedVerse: action.payload,
        isVerseSharing: true,
        // Stop screen sharing when verse sharing starts
        isScreenSharing: false
      };
    case 'STOP_VERSE_SHARING':
      return {
        ...state,
        sharedVerse: null,
        isVerseSharing: false
      };
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          { ...action.payload, recipientId: action.payload.recipientId ?? null }
        ]
      };
    case 'RECEIVE_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          { ...action.payload, recipientId: action.payload.recipientId ?? null }
        ]
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    appReducer,
    initialState,
    () => {
      try {
        const stored = localStorage.getItem('appState');
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<AppState>;
          return {
            ...initialState,
            ...parsed,
            meetings: (parsed.meetings ?? []).map((m) => ({
              ...(m as Meeting),
              date: new Date((m as Meeting).date)
            })),
            currentMeeting: parsed.currentMeeting
              ? {
                  ...(parsed.currentMeeting as Meeting),
                  date: new Date((parsed.currentMeeting as Meeting).date)
                }
              : null,
            sharedVerse: parsed.sharedVerse
              ? {
                  ...(parsed.sharedVerse as SharedVerse),
                  timestamp: new Date((parsed.sharedVerse as SharedVerse).timestamp)
                }
              : null,
            messages: (parsed.messages ?? []).map((m) => {
              const msg = m as Partial<ChatMessage> & { timestamp: string };
              return {
                ...msg,
                timestamp: new Date(msg.timestamp),
                recipientId: msg.recipientId ?? null
              } as ChatMessage;
            })
          } as AppState;
        }
      } catch (err) {
        console.error('Failed to parse stored app state', err);
      }
      return initialState;
    }
  );

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem('appState', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to persist app state to localStorage:', error);
    }
  }, [state.meetings, state.messages]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
