// Naumen ITSM 365 API client
const ITSM_API_BASE_URL = process.env.REACT_APP_ITSM_API_URL || 'https://your-instance.itsm365.com/sd';
const ITSM_API_ACCESS_KEY = process.env.REACT_APP_ITSM_ACCESS_KEY;

class ITSMApiClient {
  constructor(baseUrl = ITSM_API_BASE_URL, accessKey = ITSM_API_ACCESS_KEY) {
    this.baseUrl = baseUrl;
    this.accessKey = accessKey;
  }

  async createIncident(data) {
    try {
      const url = `${this.baseUrl}/services/rest/create-m2m/serviceCall?accessKey=${this.accessKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shortDescr: data.title,
          description: data.description,
          metaClass: 'serviceCall$call',
          // Add any additional fields as needed
          clientEmployee: data.userId, // Format should be 'employee$ID'
          category: 'Network',
          priority: 'medium',
        }),
      });

      if (!response.ok) {
        throw new Error(`ITSM API error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        incidentId: result.UUID,
        status: result.state,
      };
    } catch (error) {
      console.error('Error creating ITSM incident:', error);
      throw error;
    }
  }

  async getIncidentStatus(incidentId) {
    try {
      const url = `${this.baseUrl}/services/rest/get/${incidentId}?accessKey=${this.accessKey}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`ITSM API error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        status: result.state,
        assignedTo: result.solvedByEmployee,
        updatedAt: result.lastModifiedDate,
      };
    } catch (error) {
      console.error('Error getting incident status:', error);
      throw error;
    }
  }

  async updateIncident(incidentId, data) {
    try {
      const url = `${this.baseUrl}/services/rest/edit/${incidentId}?accessKey=${this.accessKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: data.description || undefined,
          shortDescr: data.title || undefined,
          state: data.status || undefined,
          solvedByTeam: data.team || undefined, // Format should be 'team$ID'
          solvedByEmployee: data.assignedTo || undefined, // Format should be 'employee$ID'
          resultDescr: data.work_notes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`ITSM API error: ${response.statusText}`);
      }

      const result = await response.text(); // Edit method returns text status
      return {
        status: 'success',
        message: result,
      };
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    }
  }

  async addFileToIncident(incidentId, file) {
    try {
      const url = `${this.baseUrl}/services/rest/add-file/${incidentId}?accessKey=${this.accessKey}`;
      
      const formData = new FormData();
      formData.append(file.name, file);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`ITSM API error: ${response.statusText}`);
      }

      return {
        status: 'success',
        message: 'File uploaded successfully',
      };
    } catch (error) {
      console.error('Error adding file to incident:', error);
      throw error;
    }
  }
}

export const itsmApi = new ITSMApiClient(); 