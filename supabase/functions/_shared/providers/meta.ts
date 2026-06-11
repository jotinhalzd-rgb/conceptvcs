import { WhatsAppMessage, WhatsAppProvider } from "./types.ts";

export class MetaProvider implements WhatsAppProvider {
  name = "meta";

  async sendMessage(to: string, content: string, type: string, credentials: any): Promise<any> {
    const { access_token, phone_number_id } = credentials;
    
    const body: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to.replace("whatsapp:", ""), // Meta doesn't use the prefix
    };

    if (type === 'text') {
      body.type = "text";
      body.text = { body: content };
    } else if (['image', 'video', 'document', 'audio'].includes(type)) {
      body.type = type;
      body[type] = { link: content };
    }

    const response = await fetch(`https://graph.facebook.com/v17.0/${phone_number_id}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Meta Error: ${data.error?.message || 'Unknown error'}`);
    return { sid: data.messages?.[0]?.id, status: 'accepted' };
  }

  parseWebhook(payload: any): WhatsAppMessage[] {
    const messages: WhatsAppMessage[] = [];
    const entries = payload.entry || [];
    
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;
        
        const value = change.value;
        const metadata = value.metadata;
        const recipient_id = metadata.display_phone_number;
        
        for (const msg of value.messages || []) {
          const message: WhatsAppMessage = {
            from: `whatsapp:+${msg.from}`,
            to: `whatsapp:+${recipient_id}`,
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
              filename: media.filename
            };
          }
          
          messages.push(message);
        }
      }
    }
    
    return messages;
  }
}
