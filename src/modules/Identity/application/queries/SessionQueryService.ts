// DTO para la información del usuario en una sesión.
export interface SessionUserDTO {
  id: string;
  email: string;
  name: string;
}

export interface SessionQueryService {
  getSessionUser(sessionId: string): Promise<SessionUserDTO | null>;
}
