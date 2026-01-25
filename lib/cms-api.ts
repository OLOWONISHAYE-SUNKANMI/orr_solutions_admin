

const API_BASE_URL = 'https://orr-backend.orr.solutions';

export class CMSService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // How We Operate Page
  async getHowWeOperatePage(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/how-we-operate/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch How We Operate page');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateHowWeOperatePage(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/how-we-operate/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update How We Operate page');
    }
  }

  // Services Page
  async getServicesPageContent(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/services-content/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Services page content');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateServicesPageContent(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/services-content/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update Services page content');
    }
  }

  // Resources & Blogs Page
  async getResourcesBlogsPageContent(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/resources-content/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Resources & Blogs page content');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateResourcesBlogsPageContent(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/resources-content/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update Resources & Blogs page content');
    }
  }

  // Legal & Policy Page
  async getLegalPolicyPageContent(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/legal-policy-content/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Legal & Policy page content');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateLegalPolicyPageContent(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/legal-policy-content/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update Legal & Policy page content');
    }
  }

  // Contact Page
  async getContactPageContent(): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/contact-content/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Contact page content');
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateContactPageContent(data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/contact-content/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Contact page update failed:', response.status, errorText);
      throw new Error(`Failed to update Contact page content: ${response.status}`);
    }
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

  // Service Stages
  async updateServiceStage(id: number, data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/service-stages/${id}/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Service stage update failed:', response.status, errorText);
      throw new Error(`Failed to update service stage: ${response.status}`);
    }
  }

  // Service Pillars
  async updateServicePillar(id: number, data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/service-pillars/${id}/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Service pillar update failed:', response.status, errorText);
      throw new Error(`Failed to update service pillar: ${response.status}`);
    }
  }

  // Process Steps
  async updateProcessStep(id: number, data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/process-steps/${id}/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Process step update failed:', response.status, errorText);
      throw new Error(`Failed to update process step: ${response.status}`);
    }
  }

  // Content Cards
  async updateContentCard(id: number, data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/content-cards/${id}/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Content card update failed:', response.status, errorText);
      throw new Error(`Failed to update content card: ${response.status}`);
    }
  }

  // Policy Items
  async updatePolicyItem(id: number, data: Partial<any>): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin-portal/v1/cms/policy-items/${id}/`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Policy item update failed:', response.status, errorText);
      throw new Error(`Failed to update policy item: ${response.status}`);
    }
  }
}