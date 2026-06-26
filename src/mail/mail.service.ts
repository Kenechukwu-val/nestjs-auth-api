import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendMail(options: SendMailOptions) {
    const host = this.configService.get<string>('SMTP_HOST');

    if (!host) {
      this.logger.log(`Email delivery skipped. To: ${options.to}`);
      this.logger.log(options.text);
      return;
    }

    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from:
        this.configService.get<string>('MAIL_FROM') ??
        'Auth API <no-reply@example.com>',
      ...options,
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const appUrl =
      this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';
    const verificationLink = `${appUrl}/verify-email?token=${token}`;

    await this.sendMail({
      to: email,
      subject: 'Verify your email',
      text: `Verify your email by opening this link: ${verificationLink}\n\nVerification token: ${token}`,
      html: `
        <p>Verify your email by opening this link:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>Verification token: <code>${token}</code></p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const appUrl =
      this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    await this.sendMail({
      to: email,
      subject: 'Reset your password',
      text: `Reset your password by opening this link: ${resetLink}\n\nPassword reset token: ${token}`,
      html: `
        <p>Reset your password by opening this link:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Password reset token: <code>${token}</code></p>
      `,
    });
  }
}
