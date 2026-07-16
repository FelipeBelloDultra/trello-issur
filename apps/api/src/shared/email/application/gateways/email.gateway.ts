export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailGateway {
  send(options: SendEmailOptions): Promise<void>;
}
