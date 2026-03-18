export class DomainError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message?: string,
  ) {
    super(message ?? code)
    this.name = 'DomainError'
  }
}
