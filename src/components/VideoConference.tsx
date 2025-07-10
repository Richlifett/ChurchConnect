import React, { useState, useEffect } from 'react';
import { VideoGrid } from './video/VideoGrid';
import { VideoControls } from './video/VideoControls';
import { ParticipantsList } from './video/ParticipantsList';
import { VideoSidePanel } from './video/VideoSidePanel';
import { ScreenShare } from './video/ScreenShare';
import { VerseDisplay } from './video/VerseDisplay';
import { BiblePopup } from './video/BiblePopup';
import { useApp } from '../context/AppContext';
import { webrtcService } from '../services/webrtc';
import { Play, Users, Grid3x3, User, AlertCircle, X, Book } from 'lucide-react';

export function VideoConference() {
  const { state, dispatch } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showBiblePanel, setShowBiblePanel] = useState(false);
  const [showVideoPanel, setShowVideoPanel] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Set up WebRTC event handlers
    webrtcService.onStreamReceived = (peerId: string, stream: MediaStream) => {
      // Update participant with stream
      console.log('Received stream from peer:', peerId);
    };

    webrtcService.onPeerConnected = (peerId: string) => {
      console.log('Peer connected:', peerId);
    };

    webrtcService.onPeerDisconnected = (peerId: string) => {
      console.log('Peer disconnected:', peerId);
    };

    webrtcService.onError = (error: Error) => {
      setConnectionError(error.message);
    };

    return () => {
      // Cleanup on unmount
      webrtcService.disconnectAll();
    };
  }, []);

  const handleJoinMeeting = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Initialize media first
      const stream = await webrtcService.initializeMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      
      // Join the meeting
      const meeting = state.meetings[0];
      dispatch({ type: 'JOIN_MEETING', payload: meeting });
      
      // Simulate joining WebRTC meeting
      await webrtcService.simulateJoinMeeting(meeting.id);
      
    } catch (error) {
      console.error('Failed to join meeting:', error);
      setConnectionError('Failed to access camera/microphone. Please check your permissions.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLeaveMeeting = () => {
    webrtcService.disconnectAll();
    setLocalStream(null);
    setShowBiblePanel(false);
    dispatch({ type: 'LEAVE_MEETING' });
  };

  const handleToggleVideo = async () => {
    const isVideoOn = await webrtcService.toggleVideo();
    dispatch({ type: 'TOGGLE_VIDEO' });
  };

  const handleToggleMute = async () => {
    const isAudioOn = await webrtcService.toggleAudio();
    dispatch({ type: 'TOGGLE_MUTE' });
  };

  const handleScreenShare = async () => {
    try {
      if (state.isScreenSharing) {
        // Stop screen sharing - restore camera
        const currentStream = webrtcService.getLocalStream();
        if (currentStream) {
          // Get fresh camera stream
          const cameraStream = await webrtcService.initializeMedia({
            video: true,
            audio: true
          });
          await webrtcService.replaceVideoTrack(cameraStream);
          setLocalStream(cameraStream);
        } else if (localStream) {
          await webrtcService.replaceVideoTrack(localStream);
          setLocalStream(webrtcService.getLocalStream());
        }
        dispatch({ type: 'TOGGLE_SCREEN_SHARE' });
      } else {
        // Start screen sharing
        const screenStream = await webrtcService.getDisplayMedia();
        await webrtcService.replaceVideoTrack(screenStream);
        setLocalStream(webrtcService.getLocalStream());
        dispatch({ type: 'TOGGLE_SCREEN_SHARE' });
      }
    } catch (error) {
      console.error('Screen sharing failed:', error);
      
      // Set a more user-friendly error message
      if (error instanceof Error) {
        setConnectionError(error.message);
      } else {
        setConnectionError('Screen sharing failed. Please try again.');
      }
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setConnectionError(null);
      }, 5000);
    }
  };

  const handleCloseVerseDisplay = () => {
    dispatch({ type: 'STOP_VERSE_SHARING' });
    setShowVideoPanel(false);
  };

  const handleShareVerse = () => {
    setShowBiblePanel(true);
    // Close participants panel and show video panel when sharing verse
    setShowParticipants(false);
    setShowVideoPanel(true);
  };

  if (!state.isInMeeting) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Connect?</h2>
          <p className="text-gray-600 mb-8">
            Join your church community in worship, study, and fellowship through our secure video platform.
          </p>
          
          {connectionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{connectionError}</div>
            </div>
          )}
          
          <button
            onClick={handleJoinMeeting}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isConnecting ? 'Connecting...' : 'Join Sunday Service'}
          </button>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>45 members</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div>Live now</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add local participant to the list
  const allParticipants = [
    {
      id: 'local',
      name: 'You',
      isMuted: state.isMuted,
      isVideoOn: state.isVideoOn,
      stream: localStream || undefined
    },
    ...state.participants
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-2xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-white font-semibold">{state.currentMeeting?.title}</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Live</span>
          </div>
          {state.isVerseSharing && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-300">Sharing Verse</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title={viewMode === 'grid' ? 'Switch to Speaker View' : 'Switch to Grid View'}
          >
            {viewMode === 'grid' ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Grid3x3 className="w-5 h-5 text-white" />
            )}
          </button>
          <button
            onClick={handleShareVerse}
            className={`p-2 rounded-lg transition-colors flex items-center space-x-2 ${
              showBiblePanel 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Share Bible Verse"
          >
            <Book className="w-5 h-5 text-white" />
            {showBiblePanel && <span className="text-white text-sm">Bible</span>}
          </button>
          <button
            onClick={() => {
              setShowParticipants(!showParticipants);
              // Close Bible panel if participants panel is opened
              if (!showParticipants) setShowBiblePanel(false);
            }}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Users className="w-5 h-5 text-white" />
            <span className="text-white text-sm">{allParticipants.length}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {connectionError && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-300">{connectionError}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex relative">
        <div className="flex-1 relative bg-white">
          {state.isScreenSharing ? (
            <ScreenShare />
          ) : state.isVerseSharing && state.sharedVerse ? (
            <div className="h-full overflow-auto">
              <VerseDisplay 
                verse={state.sharedVerse} 
                onClose={handleCloseVerseDisplay}
              />
            </div>
          ) : (
            <VideoGrid 
              viewMode={viewMode} 
              participants={allParticipants} 
              localStream={localStream || undefined}
            />
          )}
        </div>
        
        {/* Side Panels */}
        {(showParticipants || showBiblePanel || showVideoPanel) && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            {showParticipants && (
              <ParticipantsList participants={allParticipants} />
            )}
            
            {showVideoPanel && state.isVerseSharing && (
              <VideoSidePanel 
                participants={allParticipants}
                localStream={localStream || undefined}
                onClose={() => setShowVideoPanel(false)}
              />
            )}
            
            {showBiblePanel && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Book className="w-5 h-5 text-white" />
                    <h3 className="text-white font-semibold">Share Bible Verse</h3>
                  </div>
                  <button
                    onClick={() => setShowBiblePanel(false)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="flex-1 bg-white">
                  <BiblePopup 
                    onClose={() => setShowBiblePanel(false)} 
                    isEmbedded={true}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <VideoControls 
        onLeaveMeeting={handleLeaveMeeting}
        onToggleVideo={handleToggleVideo}
        onToggleMute={handleToggleMute}
        onScreenShare={handleScreenShare}
        onShareVerse={handleShareVerse}
      />
    </div>
  );
}