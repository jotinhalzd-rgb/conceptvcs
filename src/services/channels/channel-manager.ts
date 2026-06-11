import { IChannelAdapter, ChannelType } from "./channel-adapter";
import { WhatsAppAdapter, EmailAdapter } from "./implementations";

export class ChannelManager {
  private static instances: Map<ChannelType, IChannelAdapter> = new Map();

  static getAdapter(type: ChannelType): IChannelAdapter {
    if (!this.instances.has(type)) {
      switch (type) {
        case 'whatsapp':
          this.instances.set(type, new WhatsAppAdapter());
          break;
        case 'email':
          this.instances.set(type, new EmailAdapter());
          break;
        default:
          // Fallback para outros canais (MVP)
          this.instances.set(type, new WhatsAppAdapter());
      }
    }
    return this.instances.get(type)!;
  }
}
