export type CreateWebhookPayloadType = {
  webhookUrl: string;
};

export type CreateWebhookResponseType = {
  success: boolean;
  message: string;
  data: unknown;
  timestamp: string | null;
};
