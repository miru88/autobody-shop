import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Twilio } from 'twilio';
import { NotificationChannel } from '../entities';

export interface NotificationPayload {
  channel: NotificationChannel;
  to_email?: string;
  to_phone?: string;
  customer_name: string;
  message: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private resend: Resend;
  private _twilio: Twilio | null = null;

  constructor(private config: ConfigService) {
    this.resend = new Resend(config.get('RESEND_API_KEY'));
  }

  private getTwilio(): Twilio {
    if (!this._twilio) {
      const sid = this.config.get('TWILIO_ACCOUNT_SID');
      const token = this.config.get('TWILIO_AUTH_TOKEN');
      if (!sid || !token || sid === 'your-account-sid') {
        throw new Error('Twilio credentials are not configured');
      }
      this._twilio = new Twilio(sid, token);
    }
    return this._twilio;
  }

  async send(payload: NotificationPayload): Promise<void> {
    switch (payload.channel) {
      case 'email':
        await this.sendEmail(payload);
        break;
      case 'sms':
        await this.sendSms(payload);
        break;
      case 'whatsapp':
        await this.sendWhatsApp(payload);
        break;
    }
  }

  private async sendEmail(payload: NotificationPayload) {
    if (!payload.to_email) {
      this.logger.warn('Email channel selected but customer has no email');
      return;
    }
    await this.resend.emails.send({
      from: this.config.get('EMAIL_FROM'),
      to: payload.to_email,
      subject: `Update on your vehicle repair`,
      html: `
        <p>Hi ${payload.customer_name},</p>
        <p>${payload.message}</p>
        <p>Thanks,<br/>The Team</p>
      `,
    });
    this.logger.log(`Email sent to ${payload.to_email}`);
  }

  private async sendSms(payload: NotificationPayload) {
    if (!payload.to_phone) {
      this.logger.warn('SMS channel selected but customer has no phone');
      return;
    }
    await this.getTwilio().messages.create({
      body: `Hi ${payload.customer_name}, ${payload.message}`,
      from: this.config.get('TWILIO_FROM_NUMBER'),
      to: payload.to_phone,
    });
    this.logger.log(`SMS sent to ${payload.to_phone}`);
  }

  private async sendWhatsApp(payload: NotificationPayload) {
    if (!payload.to_phone) {
      this.logger.warn('WhatsApp channel selected but customer has no phone');
      return;
    }
    await this.getTwilio().messages.create({
      body: `Hi ${payload.customer_name}, ${payload.message}`,
      from: `whatsapp:${this.config.get('TWILIO_WHATSAPP_NUMBER')}`,
      to: `whatsapp:${payload.to_phone}`,
    });
    this.logger.log(`WhatsApp sent to ${payload.to_phone}`);
  }
}
