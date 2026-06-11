export type ChannelType = 'whatsapp' | 'instagram' | 'email' | 'messenger' | 'telegram' | 'webchat';

export interface ChannelMessage {
  id: string;
  externalId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Interface padrão que todos os conectores de canais devem implementar.
 * Segue o padrão Adapter para garantir escalabilidade multicanal global.
 */
export interface IChannelAdapter {
  type: ChannelType;
  sendMessage(to: string, content: string): Promise<boolean>;
  onMessageReceived(callback: (message: ChannelMessage) => void): void;
  getProfile(contactId: string): Promise<any>;
}

export class BaseChannelAdapter {
  protected handlers: ((message: ChannelMessage) => void)[] = [];

  onMessageReceived(callback: (message: ChannelMessage) => void): void {
    this.handlers.push(callback);
  }

  protected notifyHandlers(message: ChannelMessage): void {
    this.handlers.forEach(h => h(message));
  }
}
