import React from 'react';
import { Mic, MicOff, Video, VideoOff, MoreVertical, Crown } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOn: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
}

export function ParticipantsList({ participants }: ParticipantsListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold">Participants ({participants.length})</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {participants.map((participant, index) => (
          <div key={participant.id} className="p-3 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {participant.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{participant.name}</span>
                    {index === 0 && <Crown className="w-4 h-4 text-gold-400" />}
                  </div>
                  {index === 0 && (
                    <span className="text-xs text-gold-400">Host</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {participant.isMuted ? (
                  <MicOff className="w-4 h-4 text-red-400" />
                ) : (
                  <Mic className="w-4 h-4 text-green-400" />
                )}
                {!participant.isVideoOn && (
                  <VideoOff className="w-4 h-4 text-red-400" />
                )}
                <button className="p-1 hover:bg-gray-600 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}