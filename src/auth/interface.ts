export interface LoginResult {
  credential: {
    refreshToken: string;
    accessToken?: string;
  };
}