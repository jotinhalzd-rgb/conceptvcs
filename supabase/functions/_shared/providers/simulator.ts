import { WhatsAppMessage, WhatsAppProvider } from "./types.ts";

/**
 * SimulatorProvider — DEV/PREVIEW only.
 * Does NOT make external calls. Used by the demo channel to validate
 * the omnichannel flow inside Preview without real WhatsApp credentials.
 */
export class SimulatorProvider implements WhatsAppProvider {
  name = "development_simulator";

  async sendMessage(to: string, content: string | any, type: string, _credentials: any) {
    const sid = "sim-" + crypto.randomUUID();
    console.log(JSON.stringify({ provider: "simulator", action: "sendMessage", to, type, sid }));
    return { sid, status: "simulated_sent", to, content };
  }

  parseWebhook(payload: any): WhatsAppMessage[] {
    // Payload shape used by /functions/sim-webhook
    return [
      {
        from: String(payload.from),
        to: String(payload.to),
        body: payload.body ?? "",
        type: "text",
        timestamp: payload.timestamp ?? new Date().toISOString(),
        messageId: payload.messageId ?? `sim-in-${crypto.randomUUID()}`,
        metadata: { simulated: true },
      },
    ];
  }
}