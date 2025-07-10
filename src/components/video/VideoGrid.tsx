import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import clsx from 'clsx';
import { VideoTile } from './VideoTile';

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOn: boolean;
  stream?: MediaStream;
}

interface VideoGridProps {
  viewMode: 'grid' | 'speaker';
  participants: Participant[];
  localStream?: MediaStream;
}

export function VideoGrid({ viewMode, participants, localStream }: VideoGridProps) {
  if (viewMode === 'speaker') {
    const speaker = participants[0];
    const others = participants.slice(1);

    return (
      <div className="h-full flex">
        <div className="flex-1 relative">
          <VideoTile participant={speaker} isLarge localStream={localStream} />
        </div>
        <div className="w-64 space-y-2 p-2">
          {others.map((participant) => (
            <VideoTile key={participant.id} participant={participant} />
          ))}
        </div>
      </div>
    );
  }

  const gridCols = participants.length <= 4 ? 2 : 3;
  
  return (
    <div className={clsx(
      'h-full p-4 grid gap-4',
      gridCols === 2 ? 'grid-cols-2' : 'grid-cols-3'
    )}>
      {participants.map((participant) => (
        <VideoTile
          key={participant.id} 
          participant={participant} 
          localStream={participant.id === 'local' ? localStream : undefined}
        />
      ))}
    </div>
  );
}