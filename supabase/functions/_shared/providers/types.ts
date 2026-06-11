export interface WhatsAppMessage {
  from: string;
  to: string;
  body?: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location' | 'contacts' | 'interactive' | 'button' | 'template' | 'unknown';
  timestamp: string;
  messageId: string;
  media?: {
    url?: string;
    mimeType?: string;
    caption?: string;
    filename?: string;
    id?: string;
  };
  metadata?: any;
}

export interface WhatsAppProvider {
  name: string;
  sendMessage(to: string, content: string | any, type: string, credentials: any): Promise<any>;
  parseWebhook(payload: any): WhatsAppMessage[];
}
