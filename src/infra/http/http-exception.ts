interface HttpExceptionFormat {
  message: string;
  statusCode: number;
  errors?: Array<{
    [key: string]: string | Array<string>;
  }>;
}

export class HttpException extends Error {
  public readonly errors: HttpExceptionFormat["errors"];
  public readonly statusCode: HttpExceptionFormat["statusCode"];

  public constructor({ message, statusCode, errors }: HttpExceptionFormat) {
    super(message);
    this.name = HttpException.name;
    this.errors = errors;
    this.statusCode = statusCode;
  }
}
