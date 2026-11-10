
export interface LoginOutputDTO {
  sessionId: string;
  user: {
    id: string;
    email: string;
  };
}
