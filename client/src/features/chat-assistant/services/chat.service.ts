import type { SendMessageRequest, SendMessageResponse } from '../types';

class ChatService {
  async sendMessage(_data: SendMessageRequest): Promise<SendMessageResponse['data']> {
    // FUTURE: Real API integration
    // const response = await fetch('/api/v1/chat/message', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return response.json();

    throw new Error('API not implemented - using local mock');
  }
}

export const chatService = new ChatService();
