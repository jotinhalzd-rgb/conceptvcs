import { BaseChannelAdapter, IChannelAdapter, ChannelMessage, ChannelType } from "./channel-adapter";

export class WhatsAppAdapter extends BaseChannelAdapter implements IChannelAdapter {
  type: ChannelType = 'whatsapp';

  async sendMessage(to: string, content: string): Promise<boolean> {
    console.log(`WhatsApp Service: Enviando mensagem para ${to}...`, content);
    // Integração futura com API (Twilio, Meta, etc)
    return true;
  }

  async getProfile(contactId: string) {
    return {
      phone: contactId,
      verified: true,
      platform: 'whatsapp'
    };
  }
}

export class EmailAdapter extends BaseChannelAdapter implements IChannelAdapter {
  type: ChannelType = 'email';

  async sendMessage(to: string, content: string): Promise<boolean> {
    console.log(`Email Service: Enviando e-mail para ${to}...`, content);
    return true;
  }

  async getProfile(contactId: string) {
    return {
      email: contactId,
      platform: 'email'
    };
  }
}
