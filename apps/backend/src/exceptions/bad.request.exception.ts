export class BadRequestException implements Error {
  message: string;
  name: string;

  constructor(message: string) {
    this.message = message;
    this.name = '';
  }
}
