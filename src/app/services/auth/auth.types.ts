export type AuthResponseData = {
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;     
  expiresIn: string;  
  registered?: boolean;
};

export type AuthSession = {
  idToken: string;
  refreshToken: string;
  email: string;
  uid: string;
  expiresAt: number; // ms timestamp
};
