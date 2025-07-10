import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, Phone, Users, Settings, MessageCircle, Book } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenShareMenu } from './ScreenShareMenu';
import clsx from 'clsx';

interface VideoControlsProps {
  onLeaveMeeting: () => void;
  onToggleVideo?: () => void;
  onToggleMute?: () => void;
  onScreenShare?: () => void;
  onShareVerse?: () => void;
}

export function VideoControls({ 
  onLeaveMeeting, 
  onToggleVideo, 
  onToggleMute, 
  onScreenShare,
  onShareVerse
}: VideoControlsProps) {
  const { state, dispatch } = useApp();
  const [showScreenShareMenu, setShowScreenShareMenu] = useState(false);

  const handleToggleMute = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      dispatch({ type: 'TOGGLE_MUTE' });
    }
  };

  const handleToggleVideo = () => {
    if (onToggleVideo) {
      onToggleVideo();
    } else {
      dispatch({ type: 'TOGGLE_VIDEO' });
    }
  };

  const handleScreenShareClick = () => {
    if (state.isScreenSharing) {
      // If already sharing, stop sharing
      if (onScreenShare) {
        onScreenShare();
      } else {
        dispatch({ type: 'TOGGLE_SCREEN_SHARE' });
      }
    } else {
      // Show menu to choose what to share
      setShowScreenShareMenu(true);
    }
  };

  const handleShareScreen = async () => {
    setShowScreenShareMenu(false);
    if (onScreenShare) {
      onScreenShare();
    } else {
      dispatch({ type: 'TOGGLE_SCREEN_SHARE' });
    }
  };

  const handleShareWindow = async () => {
    setShowScreenShareMenu(false);
    // For now, use the same screen share functionality
    // In a real implementation, you'd specify different constraints
    if (onScreenShare) {
      onScreenShare();
    } else {
      dispatch({ type: 'TOGGLE_SCREEN_SHARE' });
    }
  };

  const handleShareTab = async () => {
    setShowScreenShareMenu(false);
    // For now, use the same screen share functionality
    // In a real implementation, you'd specify different constraints
    if (onScreenShare) {
      onScreenShare();
    } else {
      dispatch({ type: 'TOGGLE_SCREEN_SHARE' });
    }
  };

  const handleShareVerseFromMenu = () => {
    setShowScreenShareMenu(false);
    if (onShareVerse) {
      onShareVerse();
    }
  };

  const controlButtons = [
    {
      icon: state.isMuted ? MicOff : Mic,
      label: state.isMuted ? 'Unmute' : 'Mute',
      active: !state.isMuted,
      onClick: handleToggleMute,
      className: state.isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
    },
    {
      icon: state.isVideoOn ? Video : VideoOff,
      label: state.isVideoOn ? 'Turn Off Video' : 'Turn On Video',
      active: state.isVideoOn,
      onClick: handleToggleVideo,
      className: !state.isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
    },
    {
      icon: Monitor,
      label: state.isScreenSharing ? 'Stop Sharing' : 'Share Screen',
      active: state.isScreenSharing,
      onClick: handleScreenShareClick,
      className: state.isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'
    },
    {
      icon: Book,
      label: 'Share Verse',
      active: false,
      onClick: onShareVerse || (() => {}),
      className: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      icon: Users,
      label: 'Breakout Rooms',
      active: false,
      onClick: () => {},
      className: 'bg-gray-600 hover:bg-gray-500'
    },
    {
      icon: MessageCircle,
      label: 'Chat',
      active: false,
      onClick: () => {},
      className: 'bg-gray-600 hover:bg-gray-500'
    },
    {
      icon: Settings,
      label: 'Settings',
      active: false,
      onClick: () => {},
      className: 'bg-gray-600 hover:bg-gray-500'
    }
  ];

  return (
    <div className="bg-gray-800 px-6 py-4 flex items-center justify-between relative">
      <div className="flex items-center space-x-2">
        {controlButtons.map((button, index) => {
          const Icon = button.icon;
          return (
            <button
              key={index}
              onClick={button.onClick}
              className={clsx(
                'p-3 rounded-full text-white transition-all duration-200 hover:scale-105',
                button.className
              )}
              title={button.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      <button
        onClick={onLeaveMeeting}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
      >
        <Phone className="w-5 h-5 inline mr-2" />
        Leave Meeting
      </button>

      {showScreenShareMenu && (
        <ScreenShareMenu
          onClose={() => setShowScreenShareMenu(false)}
          onShareScreen={handleShareScreen}
          onShareWindow={handleShareWindow}
          onShareTab={handleShareTab}
          onShareVerse={handleShareVerseFromMenu}
        />
      )}
    </div>
  );
}