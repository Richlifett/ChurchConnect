import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../context/AppContext';

class ChatService {
  private socket: Socket | null = null;
  public onMessage?: (msg: ChatMessage) => void;

  connect(meetingId: string) {
    this.socket = io('http://localhost:3001', { query: { meetingId } });
    const handler = (
      data: ChatMessage & { timestamp: string; recipientId?: string | null }
    ) => {
      const msg: ChatMessage = {
        ...data,
        timestamp: new Date(data.timestamp),
        recipientId: data.recipientId ?? null
      };
      this.onMessage?.(msg);
    };

    this.socket.on('message', handler);
    this.socket.on('private-message', handler);
  }

  sendMessage(message: ChatMessage) {
    this.socket?.emit('message', message);
  }

  sendPrivateMessage(message: ChatMessage) {
    this.socket?.emit('private-message', message);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const chatService = new ChatService();
