import nodemailer from "nodemailer";
import { injectable } from "tsyringe";

import { env } from "@/config/env";
import { EmailGateway, SendEmailOptions } from "@/shared/email/application/gateways/email.gateway";

@injectable()
export class NodemailerEmailGateway implements EmailGateway {
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth:
      env.SMTP_USER !== undefined && env.SMTP_PASS !== undefined
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });

  public async send(options: SendEmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}
