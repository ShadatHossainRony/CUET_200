const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-gateway.careforall.com';
const PAYMENT_SERVICE_BASE_URL =
  import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:8004';

interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error: ApiError = {
          message: `Request failed: ${response.statusText}`,
          status: response.status,
        };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(data: { email: string; password: string; name: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verify() {
    return this.request('/auth/verify');
  }

  // Campaign endpoints
  async createCampaign(data: any) {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCampaigns(params?: { search?: string; category?: string; page?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const query = queryParams.toString();
    return this.request(`/campaigns${query ? `?${query}` : ''}`);
  }

  async getCampaign(id: string) {
    return this.request(`/campaigns/${id}`);
  }

  async updateCampaign(id: string, data: any) {
    return this.request(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Pledge endpoints
  async createRecurringPledge(data: any) {
    return this.request('/pledges/recurring', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPledge(id: string) {
    return this.request(`/pledges/${id}`);
  }

  async getPledgeHistory(userId: string) {
    return this.request(`/pledges/history/${userId}`);
  }

  async cancelPledge(id: string) {
    return this.request(`/pledges/${id}/cancel`, {
      method: 'PUT',
    });
  }

  // Payment endpoints
  async createOneTimePayment(data: any) {
    return this.request('/payment/one-time', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentStatus(transactionId: string) {
    return this.request(`/payment/status/${transactionId}`);
  }

  // Totals endpoints
  async getCampaignTotals(campaignId: string) {
    return this.request(`/totals/${campaignId}`);
  }

  async getLeaderboard() {
    return this.request('/totals/leaderboard');
  }

  // Admin endpoints
  async getAdminCampaigns() {
    return this.request('/admin/campaigns');
  }

  async getAdminPledges() {
    return this.request('/admin/pledges');
  }

  async getAdminPayments() {
    return this.request('/admin/payments');
  }

  async getAdminAnalytics() {
    return this.request('/admin/analytics');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

interface DonationSessionResponse {
  success: boolean;
  redirectUrl?: string;
  message?: string;
  error?: string;
}

export async function createDonationSession(payload: {
  campaignId: string;
  amount: number;
}): Promise<DonationSessionResponse> {
  try {
    const response = await fetch(`${PAYMENT_SERVICE_BASE_URL}/payment/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as DonationSessionResponse;
    if (!response.ok) {
      throw new Error(data.error || 'Unable to start donation');
    }

    return data;
  } catch (error) {
    console.error('Donation session failed:', error);
    throw error;
  }
}
