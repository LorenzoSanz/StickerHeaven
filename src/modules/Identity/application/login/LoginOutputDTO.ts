
// DTO para la salida del login de usuario.
export interface LoginOutputDTO {
  sessionId: string;
  user: {
    id: string;
    email: string;
  };
}
