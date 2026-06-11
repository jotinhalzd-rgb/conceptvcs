import { WhatsAppMessage, WhatsAppProvider } from "./types.ts";

export class TwilioProvider implements WhatsAppProvider {
  name = "twilio";

  async sendMessage(to: string, content: string, type: string, credentials: any): Promise<any> {
    const { account_sid, auth_token } = credentials;
    const from = credentials.identifier || credentials.from;
    const basicAuth = btoa(`${account_sid}:${auth_token}`);
    
    const body: any = {
      From: from,
      To: to,
    };

    if (type === 'text') {
      body.Body = content;
    } else {
      body.MediaUrl = content;
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(body),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Twilio Error: ${data.message}`);
    return { sid: data.sid, status: data.status };
  }

  parseWebhook(payload: any): WhatsAppMessage[] {
    // Twilio webhooks are usually single message payloads
    const message: WhatsAppMessage = {
      from: payload.From,
      to: payload.To,
      body: payload.Body,
      messageId: payload.MessageSid,
      timestamp: new Date().toISOString(),
      type: payload.NumMedia && parseInt(payload.NumMedia) > 0 ? 'image' : 'text', // Simple heuristic
    };

    if (payload.MediaUrl0) {
      message.media = {
        url: payload.MediaUrl0,
        mimeType: payload.MediaContentType0,
      };
    }

    return [message];
  }
}
