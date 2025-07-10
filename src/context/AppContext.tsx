import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface Meeting {
  id: string;
  title: string;
  date: Date;
  participants: number;
  type: 'service' | 'study' | 'prayer' | 'meeting';
}

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  /** optional categorization for filtering */
  category?: string;
  /** flag indicating the request was submitted anonymously */
  anonymous?: boolean;
  author: string;
  date: Date;
  prayers: number;
}

interface SharedVerse {
  id: string;
  reference: string;
  text: string;
  translation: string;
  sharedBy: string;
  timestamp: Date;
}

interface AppState {
  meetings: Meeting[];
  prayerRequests: PrayerRequest[];
  currentMeeting: Meeting | null;
  isInMeeting: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  participants: { id: string; name: string; isMuted: boolean; isVideoOn: boolean }[];
  sharedVerse: SharedVerse | null;
  isVerseSharing: boolean;
}

type AppAction =
  | { type: 'JOIN_MEETING'; payload: Meeting }
  | { type: 'LEAVE_MEETING' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_VIDEO' }
  | { type: 'TOGGLE_SCREEN_SHARE' }
  | { type: 'ADD_PRAYER_REQUEST'; payload: PrayerRequest }
  | { type: 'ADD_MEETING'; payload: Meeting }
  | { type: 'SHARE_VERSE'; payload: SharedVerse }
  | { type: 'STOP_VERSE_SHARING' };

const initialState: AppState = {
  meetings: [
    {
      id: '1',
      title: 'Sunday Morning Service',
      date: new Date(2024, 11, 15, 10, 0),
      participants: 45,
      type: 'service'
    },
    {
      id: '2',
      title: 'Wednesday Bible Study',
      date: new Date(2024, 11, 18, 19, 0),
      participants: 12,
      type: 'study'
    }
  ],
  prayerRequests: [
    {
      id: '1',
      title: 'Healing for Sarah',
      description: 'Please pray for Sarah\'s recovery from surgery. She\'s scheduled for a procedure next week.',
      author: 'John Smith',
      date: new Date(2024, 11, 10),
      prayers: 23
    },
    {
      id: '2',
      title: 'Mission Trip Safety',
      description: 'Our youth group is traveling to Mexico next month. Pray for safe travels and open hearts.',
      author: 'Pastor Mike',
      date: new Date(2024, 11, 12),
      prayers: 31
    }
  ],
  currentMeeting: null,
  isInMeeting: false,
  isMuted: false,
  isVideoOn: true,
  isScreenSharing: false,
  participants: [],
  sharedVerse: null,
  isVerseSharing: false
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
    case 'ADD_PRAYER_REQUEST':
      return {
        ...state,
        prayerRequests: [...state.prayerRequests, action.payload]
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
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

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