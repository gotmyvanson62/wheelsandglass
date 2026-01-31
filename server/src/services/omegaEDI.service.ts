import axios from 'axios';
import type { OmegaEDIJob } from 'shared';

class OmegaEDIService {
  private apiUrl: string;
  private apiKey: string;
  private shopId: string;

  constructor() {
    this.apiUrl = process.env.OMEGA_API_URL || 'https://api.omega.com';
    this.apiKey = process.env.OMEGA_API_KEY || '';
    this.shopId = process.env.OMEGA_SHOP_ID || '';
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createJob(job: any): Promise<OmegaEDIJob> {
    if (!this.apiKey) {
      throw new Error('Omega EDI API key is not configured');
    }

    const payload = this.transformToOmegaFormat(job);
    const response = await axios.post(
      `${this.apiUrl}/api/jobs`,
      payload,
      { headers: this.headers }
    );
    return response.data;
  }

  async updateJob(omegaJobId: string, job: any): Promise<OmegaEDIJob> {
    if (!this.apiKey) {
      throw new Error('Omega EDI API key is not configured');
    }

    const payload = this.transformToOmegaFormat(job);
    const response = await axios.put(
      `${this.apiUrl}/api/jobs/${omegaJobId}`,
      payload,
      { headers: this.headers }
    );
    return response.data;
  }

  async getJob(omegaJobId: string): Promise<OmegaEDIJob> {
    if (!this.apiKey) {
      throw new Error('Omega EDI API key is not configured');
    }

    const response = await axios.get(
      `${this.apiUrl}/api/jobs/${omegaJobId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  async syncJob(job: any): Promise<OmegaEDIJob> {
    if (job.omegaJobId) {
      return this.getJob(job.omegaJobId);
    } else {
      return this.createJob(job);
    }
  }

  private transformToOmegaFormat(job: any): Partial<OmegaEDIJob> {
    const contact = job.contact || {};

    return {
      shopId: this.shopId,
      customerInfo: {
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
        phone: contact.phone || '',
        email: contact.email || '',
        address: contact.address || '',
        city: contact.city || '',
        state: contact.state || '',
        postalCode: contact.zipCode || '',
      },
      vehicleInfo: {
        vin: job.vehicleVIN || '',
        year: job.vehicleYear || 0,
        make: job.vehicleMake || '',
        model: job.vehicleModel || '',
        color: job.vehicleColor || '',
        description: `${job.vehicleYear} ${job.vehicleMake} ${job.vehicleModel}`.trim(),
        licensePlate: job.licensePlate || '',
        odometer: job.odometer?.toString() || '',
      },
      glassInfo: {
        nagsCode: job.nagsCode || '',
        partNumber: job.partNumber || '',
        description: job.glassType || '',
        damageType: job.damageDescription || '',
      },
      insurance: job.insuranceCompany ? {
        company: job.insuranceCompany,
        policyNumber: job.policyNumber || '',
        claimNumber: job.claimNumber || '',
      } : undefined,
      appointment: {
        date: job.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[0] : '',
        time: job.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[1].split('.')[0] : '',
        type: 'installation',
        status: job.status || 'pending',
        completedDate: job.completedDate ? new Date(job.completedDate).toISOString() : undefined,
      },
      scheduling: {
        scheduledDate: job.scheduledDate ? new Date(job.scheduledDate).toISOString() : undefined,
        completedDate: job.completedDate ? new Date(job.completedDate).toISOString() : undefined,
      },
      invoice: {
        items: [],
        subtotal: parseFloat(job.contractedAmount || 0),
        tax: 0,
        total: parseFloat(job.contractedAmount || 0),
        grossMargin: 0,
      },
      pricing: {
        laborAmount: 0,
        partsAmount: 0,
        taxAmount: 0,
        totalAmount: parseFloat(job.contractedAmount || 0),
      },
      billing: {
        account: contact.companyName || '',
        accountPhone: contact.phone || '',
        accountAddress: contact.address || '',
        pricingProfile: 'standard',
        poNumber: '',
      },
      jobInfo: {
        csr: job.csr || '',
        dispatcher: job.dispatcher || '',
        biller: job.biller || '',
        salesRep: job.salesRep || '',
        location: job.location || '',
        campaign: job.campaign || '',
        status: job.status || 'pending',
        tags: Array.isArray(job.tags) ? job.tags : [],
      },
      payments: [],
      notes: [],
      status: job.status || 'pending',
    };
  }
}

export const omegaEDIService = new OmegaEDIService();
