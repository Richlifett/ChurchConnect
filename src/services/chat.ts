import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../context/AppContext';

class ChatService {
  private socket: Socket | null = null;
  public onMessage?: (msg: ChatMessage) => void;

  connect(meetingId: string) {
    this.socket = io('http://localhost:3001', { query: { meetingId } });
    this.socket.on('message', (data: ChatMessage) => {
      const msg: ChatMessage = {
        ...data,
        timestamp: new Date(data.timestamp)
      };
      this.onMessage?.(msg);
    });
    this.socket.on('privateMessage', (data: ChatMessage) => {
      const msg: ChatMessage = {
        ...data,
        timestamp: new Date(data.timestamp)
      };
      this.onMessage?.(msg);
    });
  }

  sendMessage(message: ChatMessage) {
    this.socket?.emit('message', message);
  }

  sendPrivateMessage(recipientId: string, message: ChatMessage) {
    this.socket?.emit('privateMessage', { ...message, recipientId });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const chatService = new ChatService();
