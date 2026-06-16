import { BaseChannelAdapter, IChannelAdapter, ChannelMessage, ChannelType } from "./channel-adapter";
import { toast } from "sonner";

export class WhatsAppAdapter extends BaseChannelAdapter implements IChannelAdapter {
  type: ChannelType = 'whatsapp';

  async sendMessage(to: string, content: string): Promise<boolean> {
    try {
      if (!to || !content) throw new Error("Dados de envio incompletos.");
      
      if (import.meta.env.DEV) console.log(`WhatsApp Service: Enviando mensagem para ${to}...`, content);
      // Integração futura com API (Twilio, Meta, etc)
      return true;
    } catch (error: any) {
      console.error("WhatsApp Send Error:", error);
      toast.error(`Falha ao enviar WhatsApp: ${error.message}`);
      return false;
    }
  }

  async getProfile(contactId: string) {
    try {
      if (!contactId) throw new Error("ID do contato não fornecido.");
      return {
        phone: contactId,
        verified: true,
        platform: 'whatsapp'
      };
    } catch (error) {
      console.error("WhatsApp Profile Error:", error);
      throw error;
    }
  }
}

export class EmailAdapter extends BaseChannelAdapter implements IChannelAdapter {
  type: ChannelType = 'email';

  async sendMessage(to: string, content: string): Promise<boolean> {
    try {
      if (!to || !content) throw new Error("Dados de envio de e-mail incompletos.");
      
      if (import.meta.env.DEV) console.log(`Email Service: Enviando e-mail para ${to}...`, content);
      return true;
    } catch (error: any) {
      console.error("Email Send Error:", error);
      toast.error(`Falha ao enviar e-mail: ${error.message}`);
      return false;
    }
  }

  async getProfile(contactId: string) {
    try {
      if (!contactId) throw new Error("ID do contato de e-mail não fornecido.");
      return {
        email: contactId,
        platform: 'email'
      };
    } catch (error) {
      console.error("Email Profile Error:", error);
      throw error;
    }
  }
}
