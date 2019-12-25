export interface LoginResult {
  isAnonymous?: boolean;
  credential: {
    refreshToken: string;
    accessToken?: string;
  };
}