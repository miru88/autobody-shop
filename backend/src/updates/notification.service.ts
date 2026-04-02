import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as twilio from 'twilio';
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
  private twilio: twilio.Twilio;

  constructor(private config: ConfigService) {
    this.resend = new Resend(config.get('RESEND_API_KEY'));
    this.twilio = twilio.default(
      config.get('TWILIO_ACCOUNT_SID'),
      config.get('TWILIO_AUTH_TOKEN'),
    );
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
    await this.twilio.messages.create({
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
    await this.twilio.messages.create({
      body: `Hi ${payload.customer_name}, ${payload.message}`,
      from: `whatsapp:${this.config.get('TWILIO_WHATSAPP_NUMBER')}`,
      to: `whatsapp:${payload.to_phone}`,
    });
    this.logger.log(`WhatsApp sent to ${payload.to_phone}`);
  }
}
