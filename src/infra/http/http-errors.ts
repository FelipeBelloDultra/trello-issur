export interface HttpErrorBody {
  type: string;
  title: string;
  status: number;
  detail: string;
}

export class HttpErrors {
  public static emailAlreadyTaken(detail: string): HttpErrorBody {
    return {
      type: "/errors/email-already-taken",
      title: "Email Already Taken",
      status: 409,
      detail,
    };
  }

  public static unprocessableEntity(detail: string): HttpErrorBody {
    return {
      type: "/errors/unprocessable-entity",
      title: "Unprocessable Entity",
      status: 422,
      detail,
    };
  }

  public static internalServerError(): HttpErrorBody {
    return {
      type: "/errors/internal-server-error",
      title: "Internal Server Error",
      status: 500,
      detail: "An unexpected error occurred.",
    };
  }
}
