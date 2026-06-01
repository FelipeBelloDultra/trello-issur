export interface SendWelcomeEmailGateway {
  send(name: string, email: string): Promise<void>;
}
