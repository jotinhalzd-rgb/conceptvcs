import { WhatsAppMessage, WhatsAppProvider } from "./types.ts";

export class ThreeSixtyProvider implements WhatsAppProvider {
  name = "360dialog";

  async sendMessage(to: string, content: string, type: string, credentials: any): Promise<any> {
    const { api_key, api_url } = credentials; // api_url e.g. https://waba-v2.360dialog.io/v1/messages
    
    const body: any = {
      recipient_type: "individual",
      to: to.replace("whatsapp:", ""),
      type: type === 'text' ? 'text' : type,
    };

    if (type === 'text') {
      body.text = { body: content };
    } else {
      body[type] = { link: content };
    }

    const response = await fetch(`${api_url || 'https://waba-v2.360dialog.io/v1'}/messages`, {
      method: "POST",
      headers: {
        "D360-API-KEY": api_key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`360Dialog Error: ${JSON.stringify(data)}`);
    return { sid: data.messages?.[0]?.id, status: 'sent' };
  }

  parseWebhook(payload: any): WhatsAppMessage[] {
    const messages: WhatsAppMessage[] = [];
    if (!payload.messages) return [];

    for (const msg of payload.messages) {
      const message: WhatsAppMessage = {
        from: `whatsapp:+${msg.from}`,
        to: `whatsapp:+${payload.contacts?.[0]?.wa_id || ''}`, // Heuristic
        messageId: msg.id,
        timestamp: new Date(parseInt(msg.timestamp) * 1000).toISOString(),
        type: msg.type,
      };

      if (msg.type === 'text') {
        message.body = msg.text.body;
      } else if (msg[msg.type]) {
        const media = msg[msg.type];
        message.media = {
          id: media.id,
          mimeType: media.mime_type,
          caption: media.caption,
        };
      }
      messages.push(message);
    }
    return messages;
  }
}
