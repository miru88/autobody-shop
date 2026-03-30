export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'staff';
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  vehicles?: Vehicle[];
  jobs?: Job[];
}

export interface Vehicle {
  id: string;
  customer_id: string;
  customer?: Customer;
  make: string;
  model: string;
  year: number;
  colour?: string;
  registration?: string;
  vin?: string;
  created_at: string;
}

export type JobStatus =
  | 'received'
  | 'assessment'
  | 'in_progress'
  | 'paint'
  | 'quality_check'
  | 'ready'
  | 'collected';

export const JOB_STATUSES: { value: JobStatus; label: string }[] = [
  { value: 'received',      label: 'Received' },
  { value: 'assessment',    label: 'Assessment' },
  { value: 'in_progress',   label: 'In Progress' },
  { value: 'paint',         label: 'Paint' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'ready',         label: 'Ready for Collection' },
  { value: 'collected',     label: 'Collected' },
];

export interface Job {
  id: string;
  customer_id: string;
  customer?: Customer;
  vehicle_id?: string;
  vehicle?: Vehicle;
  description: string;
  status: JobStatus;
  notes?: string;
  portal_token: string;
  date_received?: string;
  estimated_completion?: string;
  created_at: string;
  updated_at: string;
  photos?: Photo[];
  invoices?: Invoice[];
}

export interface Photo {
  id: string;
  job_id: string;
  url: string;
  s3_key: string;
  caption?: string;
  visible_to_customer: boolean;
  uploaded_by?: string;
  created_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  job_id: string;
  job?: Job;
  invoice_number: string;
  status: InvoiceStatus;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  notes?: string;
  pdf_url?: string;
  sent_at?: string;
  paid_at?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  line_items: LineItem[];
}

export interface LineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
