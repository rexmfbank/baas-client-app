export type ApiKeysType = {
  publicKey: string;
  secretKey: string;
};

export type ApiKeysResponseType = {
  success: boolean;
  message: string;
  data: ApiKeysType[];
  timestamp: string | null;
};
