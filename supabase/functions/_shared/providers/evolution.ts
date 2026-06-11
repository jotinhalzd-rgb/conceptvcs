import { WhatsAppMessage, WhatsAppProvider } from "./types.ts";

export class EvolutionProvider implements WhatsAppProvider {
  name = "evolution";

  async sendMessage(to: string, content: string, type: string, credentials: any): Promise<any> {
    const { api_url, api_key, instance_name } = credentials;
    
    let endpoint = `${api_url}/message/sendText/${instance_name}`;
    let body: any = {
      number: to.replace("whatsapp:", ""),
      options: { delay: 1200, presence: "composing" },
      textMessage: { text: content }
    };

    if (type !== 'text') {
      endpoint = `${api_url}/message/sendMedia/${instance_name}`;
      body = {
        number: to.replace("whatsapp:", ""),
        mediaMessage: {
          mediatype: type,
          caption: "",
          media: content
        }
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "apikey": api_key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Evolution Error: ${JSON.stringify(data)}`);
    return { sid: data.key?.id || data.messageId, status: 'sent' };
  }

  parseWebhook(payload: any): WhatsAppMessage[] {
    if (payload.event !== 'messages.upsert') return [];
    
    const msg = payload.data?.message;
    if (!msg) return [];

    const from = payload.data?.key?.remoteJid.split('@')[0];
    const isMe = payload.data?.key?.fromMe;
    if (isMe) return []; // Ignore self messages from evolution instance

    const message: WhatsAppMessage = {
      from: `whatsapp:+${from}`,
      to: `whatsapp:+${payload.instance}`, // Instance as proxy for recipient
      messageId: payload.data?.key?.id,
      timestamp: new Date(payload.data?.messageTimestamp * 1000).toISOString(),
      type: payload.data?.messageType === 'conversation' ? 'text' : 'media',
    };

    if (payload.data?.messageType === 'conversation') {
      message.body = msg.conversation;
    } else if (payload.data?.messageType === 'extendedTextMessage') {
      message.body = msg.extendedTextMessage?.text;
    }

    return [message];
  }
}
