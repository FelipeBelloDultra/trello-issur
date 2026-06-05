interface HttpExceptionFormat {
  message: string;
  statusCode: number;
}

export class HttpException extends Error {
  public readonly statusCode: HttpExceptionFormat["statusCode"];

  public constructor({ message, statusCode }: HttpExceptionFormat) {
    super(message);
    this.name = HttpException.name;
    this.statusCode = statusCode;
  }
}
