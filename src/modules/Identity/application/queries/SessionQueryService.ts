export interface SessionUserDTO {
  id: string;
  email: string;
  name: string;
}

export interface SessionQueryService {
  getSessionUser(sessionId: string): Promise<SessionUserDTO | null>;
}
