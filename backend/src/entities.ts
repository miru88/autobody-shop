import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

// ─── User ────────────────────────────────────────────────────────────────────

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ default: 'staff' })
  role: 'owner' | 'staff';

  @Column()
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

// ─── Customer ─────────────────────────────────────────────────────────────────

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Vehicle, (v) => v.customer)
  vehicles: Vehicle[];

  @OneToMany(() => Job, (j) => j.customer)
  jobs: Job[];
}

// ─── Vehicle ──────────────────────────────────────────────────────────────────

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, (c) => c.vehicles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  customer_id: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ nullable: true })
  colour: string;

  @Column({ nullable: true })
  registration: string;

  @Column({ nullable: true })
  vin: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Job, (j) => j.vehicle)
  jobs: Job[];
}

// ─── Job ──────────────────────────────────────────────────────────────────────

export type JobStatus =
  | 'received'
  | 'assessment'
  | 'in_progress'
  | 'paint'
  | 'quality_check'
  | 'ready'
  | 'collected';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, (c) => c.jobs)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  customer_id: string;

  @ManyToOne(() => Vehicle, (v) => v.jobs, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ nullable: true })
  vehicle_id: string;

  @Column()
  description: string;

  @Column({ default: 'received' })
  status: JobStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ unique: true })
  portal_token: string;

  @Column({ nullable: true, type: 'date' })
  date_received: Date;

  @Column({ nullable: true, type: 'date' })
  estimated_completion: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Photo, (p) => p.job)
  photos: Photo[];

  @OneToMany(() => Invoice, (i) => i.job)
  invoices: Invoice[];

  @BeforeInsert()
  generateToken() {
    if (!this.portal_token) {
      this.portal_token = uuidv4();
    }
  }
}

// ─── Photo ────────────────────────────────────────────────────────────────────

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, (j) => j.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column()
  job_id: string;

  @Column()
  s3_key: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  caption: string;

  @Column({ default: false })
  visible_to_customer: boolean;

  @Column({ nullable: true })
  uploaded_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, (j) => j.invoices)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column()
  job_id: string;

  @Column({ unique: true })
  invoice_number: string;

  @Column({ default: 'draft' })
  status: InvoiceStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20 })
  vat_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vat_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  pdf_s3_key: string;

  @Column({ nullable: true })
  pdf_url: string;

  @Column({ nullable: true, type: 'timestamptz' })
  sent_at: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  paid_at: Date;

  @Column({ nullable: true, type: 'date' })
  due_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => InvoiceLineItem, (li) => li.invoice, { cascade: true })
  line_items: InvoiceLineItem[];
}

// ─── InvoiceLineItem ──────────────────────────────────────────────────────────

@Entity('invoice_line_items')
export class InvoiceLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (i) => i.line_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column()
  invoice_id: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  line_total: number;
}
