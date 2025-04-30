export interface TokenResource {
  message: string;
  accessToken?: string;
  deviceCode?: string;
  userCode?: string;
  verificationUri?: string;
}

export interface TokenItem {
  id: string;
  name: string;
  token: string;
  createdAt: number;
  default: boolean;
}
