

const API_BASE_URL = 'http://127.0.0.1:80002';

export class CMSService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async updateHomepage(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/homepage/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Homepage update failed:', response.status, errorText);
      throw new Error(`Failed to update homepage: ${response.status}`);
    }
  }

  async updateApproachSection(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/approach-section/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update approach section');
    }
  }

  async updateBusinessSystemSection(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/business-system-section/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update business system section');
    }
  }

  async updateORRRoleSection(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/orr-role-section/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update ORR role section');
    }
  }

  async updateMessageStrip(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/message-strip/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update message strip');
    }
  }

  async updateProcessSection(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/process-section/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update process section');
    }
  }

  async updateORRReportSection(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/orr-report-section/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update ORR report section');
    }
  }

  async updateServiceCard(id: number, data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/service-cards/${id}/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update service card');
    }
  }

  async updateProcessStage(id: number, data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/process-stages/${id}/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update process stage');
    }
  }

  async getHomepage(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/homepage/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch homepage');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getApproachSection(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/approach-section/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch approach section');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getBusinessSystemSection(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/business-system-section/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch business system section');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getORRRoleSection(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/orr-role-section/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch ORR role section');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getMessageStrip(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/message-strip/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch message strip');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getProcessSection(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/process-section/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch process section');
    }

    const result = await response.json();
    return result.data || result;
  }

  async getORRReportSection(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/orr-report-section/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch ORR report section');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateFAQ(id: number, data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/faqs/${id}/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FAQ update failed:', response.status, errorText);
      throw new Error(`Failed to update FAQ: ${response.status}`);
    }
  }
}