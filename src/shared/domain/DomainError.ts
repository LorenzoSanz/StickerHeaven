export class DomainError {
  public readonly message: string;
  public name: string;

  constructor(message: string) {
    this.message = message;
    this.name = "DomainError";
  }
}
