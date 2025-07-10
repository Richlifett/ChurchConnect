import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import clsx from 'clsx';
import { webrtcService } from '../../services/webrtc';

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

function VideoTile({ 
  participant, 
  isLarge = false, 
  localStream 
}: { 
  participant: Participant; 
  isLarge?: boolean;
  localStream?: MediaStream;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const stream = participant.id === 'local' ? localStream : participant.stream;
    
    if (stream && participant.isVideoOn) {
      videoElement.srcObject = stream;
      
      // Handle play with proper error handling to prevent interruption warnings
      const playVideo = async () => {
        try {
          await videoElement.play();
        } catch (error) {
          // Ignore AbortError which occurs during HMR/page reloads
          if (error instanceof Error && error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
            console.warn('Video play failed:', error.message);
          }
        }
      };
      
      playVideo();
    } else {
      videoElement.srcObject = null;
    }

    // Cleanup function to handle component unmounting
    return () => {
      if (videoElement && videoElement.srcObject) {
        videoElement.pause();
        videoElement.srcObject = null;
      }
    };
  }, [participant.stream, participant.isVideoOn, localStream, participant.id]);

  return (
    <div className={clsx(
      'relative bg-gray-700 rounded-lg overflow-hidden',
      isLarge ? 'h-full' : 'aspect-video'
    )}>
      {/* Video element */}
      {participant.isVideoOn ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={participant.id === 'local'} // Mute local video to prevent feedback
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-semibold text-white">
              {participant.name.charAt(0)}
            </span>
          </div>
        </div>
      )}

      {/* Participant info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">
            {participant.name}
            {participant.id === 'local' && ' (You)'}
          </span>
          <div className="flex items-center space-x-1">
            {participant.isMuted ? (
              <MicOff className="w-4 h-4 text-red-400" />
            ) : (
              <Mic className="w-4 h-4 text-green-400" />
            )}
            {!participant.isVideoOn && (
              <VideoOff className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}