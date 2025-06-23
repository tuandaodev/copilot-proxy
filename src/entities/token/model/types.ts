export interface TokenAuth {
  message: string;
  accessToken?: string;
  deviceCode?: string;
  userCode?: string;
  verificationUri?: string;
}

export interface TokenItem extends TokenStorageItem {
  default: boolean;
}

export interface TokenStorageItem {
  id: string;
  name: string;
  token: string;
  createdAt: number;
  meta?: {
    chatQuota: number | null;
    completionsQuota: number | null;
    resetTime: number | null;
  };
}
