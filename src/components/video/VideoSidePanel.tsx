import React from 'react';
import { Mic, MicOff, Video, VideoOff, Users, X } from 'lucide-react';
import { VideoTile } from './VideoTile';

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOn: boolean;
  stream?: MediaStream;
}

interface VideoSidePanelProps {
  participants: Participant[];
  localStream?: MediaStream;
  onClose: () => void;
}

export function VideoSidePanel({ participants, localStream, onClose }: VideoSidePanelProps) {
  return (
    <div className="flex-1 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold">Video Conference</h3>
            <span className="text-sm text-gray-400">({participants.length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300">Live</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Hide video panel"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Video tiles */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {participants.map((participant) => (
          <div key={participant.id} className="relative">
            <VideoTile
              participant={participant}
              localStream={participant.id === 'local' ? localStream : undefined}
              compact={true}
            />
            
            {/* Participant info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium truncate">
                  {participant.name}
                  {participant.id === 'local' && ' (You)'}
                </span>
                <div className="flex items-center space-x-1">
                  {participant.isMuted ? (
                    <MicOff className="w-3 h-3 text-red-400" />
                  ) : (
                    <Mic className="w-3 h-3 text-green-400" />
                  )}
                  {!participant.isVideoOn && (
                    <VideoOff className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          Live video feeds • Verse shared with all participants
        </div>
      </div>
    </div>
  );
}