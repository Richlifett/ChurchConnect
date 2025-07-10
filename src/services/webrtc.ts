import Peer from 'simple-peer';

export interface PeerConnection {
  id: string;
  peer: Peer.Instance;
  stream?: MediaStream;
}

export interface MediaSettings {
  video: boolean;
  audio: boolean;
}

class WebRTCService {
  private localStream: MediaStream | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private mediaSettings: MediaSettings = { video: true, audio: true };
  
  // Event callbacks
  public onStreamReceived?: (peerId: string, stream: MediaStream) => void;
  public onPeerConnected?: (peerId: string) => void;
  public onPeerDisconnected?: (peerId: string) => void;
  public onError?: (error: Error) => void;

  async initializeMedia(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.mediaSettings = {
        video: !!constraints.video,
        audio: !!constraints.audio
      };
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  async getDisplayMedia(): Promise<MediaStream> {
    try {
      // Check if getDisplayMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser');
      }

      return await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
    } catch (error) {
      console.error('Error accessing screen share:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Screen sharing permission denied. Please allow screen sharing and try again.');
        } else if (error.name === 'NotSupportedError') {
          throw new Error('Screen sharing is not supported in this browser');
        } else if (error.name === 'AbortError') {
          throw new Error('Screen sharing was cancelled');
        }
      }
      
      throw new Error('Failed to access screen sharing');
    }
  }

  createPeerConnection(peerId: string, initiator: boolean = false): PeerConnection {
    try {
      const peer = new Peer({
        initiator,
        trickle: false,
        stream: this.localStream || undefined,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      const peerConnection: PeerConnection = {
        id: peerId,
        peer
      };

      // Handle peer events
      peer.on('signal', (data) => {
        // In a real implementation, you'd send this signal data to the remote peer
        // via your signaling server (WebSocket, Socket.IO, etc.)
        console.log('Signal data for peer', peerId, data);
      });

      peer.on('stream', (stream) => {
        peerConnection.stream = stream;
        this.onStreamReceived?.(peerId, stream);
      });

      peer.on('connect', () => {
        console.log('Connected to peer:', peerId);
        this.onPeerConnected?.(peerId);
      });

      peer.on('close', () => {
        console.log('Peer connection closed:', peerId);
        this.peers.delete(peerId);
        this.onPeerDisconnected?.(peerId);
      });

      peer.on('error', (error) => {
        console.error('Peer error:', error);
        this.onError?.(error);
      });

      this.peers.set(peerId, peerConnection);
      return peerConnection;
    } catch (error) {
      console.error('Failed to create peer connection:', error);
      throw new Error('Failed to create peer connection');
    }
  }

  signal(peerId: string, signalData: any) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.peer.signal(signalData);
    }
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.mediaSettings.video = videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.mediaSettings.audio = audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  async replaceVideoTrack(newStream: MediaStream) {
    const videoTrack = newStream.getVideoTracks()[0];
    if (!videoTrack) return;

    // Replace video track for all peer connections
    for (const peerConnection of this.peers.values()) {
      try {
        const sender = peerConnection.peer._pc?.getSenders().find(
          s => s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      } catch (error) {
        console.error('Failed to replace video track for peer:', peerConnection.id, error);
      }
    }

    // Update local stream
    if (this.localStream) {
      const oldVideoTrack = this.localStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        this.localStream.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }
      this.localStream.addTrack(videoTrack);
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getPeerStream(peerId: string): MediaStream | undefined {
    return this.peers.get(peerId)?.stream;
  }

  getMediaSettings(): MediaSettings {
    return { ...this.mediaSettings };
  }

  disconnectPeer(peerId: string) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.peer.destroy();
      this.peers.delete(peerId);
    }
  }

  disconnectAll() {
    for (const peerConnection of this.peers.values()) {
      peerConnection.peer.destroy();
    }
    this.peers.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  // Simulate joining a meeting (in a real app, this would connect to a signaling server)
  async simulateJoinMeeting(meetingId: string): Promise<void> {
    try {
      // Simulate other participants
      const simulatedPeers = ['peer1', 'peer2', 'peer3'];
      
      for (const peerId of simulatedPeers) {
        setTimeout(() => {
          try {
            this.createPeerConnection(peerId, false);
            // Simulate receiving a stream
            setTimeout(() => {
              this.simulateRemoteStream(peerId);
            }, 1000);
          } catch (error) {
            console.error('Failed to create simulated peer:', peerId, error);
          }
        }, Math.random() * 2000);
      }
    } catch (error) {
      console.error('Failed to join meeting:', error);
      throw error;
    }
  }

  private simulateRemoteStream(peerId: string) {
    try {
      // Create a canvas element to generate a fake video stream
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw a simple animated background
        const animate = () => {
          ctx.fillStyle = `hsl(${Date.now() / 50 % 360}, 50%, 50%)`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.fillStyle = 'white';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Participant ${peerId}`, canvas.width / 2, canvas.height / 2);
          
          requestAnimationFrame(animate);
        };
        animate();
      }

      // Create a stream from the canvas
      const stream = canvas.captureStream(30);
      
      // Add an audio track (silent)
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0; // Silent
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const audioStream = audioContext.createMediaStreamDestination();
      oscillator.connect(audioStream);
      oscillator.start();
      
      stream.addTrack(audioStream.stream.getAudioTracks()[0]);
      
      // Simulate receiving this stream
      this.onStreamReceived?.(peerId, stream);
    } catch (error) {
      console.error('Failed to simulate remote stream for peer:', peerId, error);
    }
  }
}

export const webrtcService = new WebRTCService();