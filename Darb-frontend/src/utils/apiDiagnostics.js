import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * Utility to test all API endpoints and diagnose issues
 */
const ApiDiagnostics = {
  /**
   * Get the authentication token
   * @returns {string|null} The auth token
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  },
  
  /**
   * Test a specific API endpoint
   * @param {string} name - Name of the endpoint for logging
   * @param {string} url - URL to test
   * @returns {Promise<Object>} Test result with status and info
   */
  async testEndpoint(name, url) {
    console.log(`Testing endpoint: ${name} (${url})`);
    
    try {
      const token = this.getAuthToken();
      
      if (!token && name !== 'Public Endpoint') {
        return {
          name,
          url,
          status: 'warning',
          info: 'No auth token available'
        };
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        }
      });
      
      console.log(`${name} response status:`, response.status);
      
      let responseType = '';
      const contentType = response.headers.get('content-type');
      if (contentType) {
        responseType = contentType.includes('application/json') ? 'JSON' : contentType;
      }
      
      let data = null;
      
      try {
        // Try to get response as text first
        const text = await response.text();
        
        // Then try to parse as JSON if it looks like JSON
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          data = JSON.parse(text);
        } else {
          // If not JSON, just store first 100 chars
          data = text.substring(0, 100);
        }
      } catch (error) {
        console.error(`Error parsing ${name} response:`, error);
      }
      
      return {
        name,
        url,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        responseType,
        info: response.ok ? 'Endpoint working' : `Error ${response.status}: ${response.statusText}`,
        data: data
      };
    } catch (error) {
      console.error(`Error testing ${name}:`, error);
      return {
        name,
        url,
        status: 'error',
        info: `Request failed: ${error.message}`,
        error
      };
    }
  },
  
  /**
   * Test all API endpoints to diagnose issues
   * @returns {Promise<Array>} Test results for all endpoints
   */
  async testAllEndpoints() {
    const results = [];
    
    // Test the API base URL first
    results.push(await this.testEndpoint('API Base', API_ENDPOINTS.AUTH.REGISTER.split('/api/')[0]));
    
    // Test auth endpoints
    results.push(await this.testEndpoint('Auth: Profile', API_ENDPOINTS.AUTH.PROFILE));
    
    // Test campaign endpoints
    results.push(await this.testEndpoint('Campaigns: Base', API_ENDPOINTS.CAMPAIGNS.BASE));
    results.push(await this.testEndpoint('Campaigns: My Campaigns', API_ENDPOINTS.CAMPAIGNS.MY_CAMPAIGNS));
    results.push(await this.testEndpoint('Campaigns: Viewed', API_ENDPOINTS.CAMPAIGNS.VIEWED));
    results.push(await this.testEndpoint('Campaigns: Favorites', API_ENDPOINTS.CAMPAIGNS.FAVORITES));
    results.push(await this.testEndpoint('Campaigns: Most Viewed', API_ENDPOINTS.CAMPAIGNS.MOST_VIEWED));
    
    // Test draft endpoints
    results.push(await this.testEndpoint('Drafts: Base', API_ENDPOINTS.DRAFTS.BASE));
    
    // Log the results
    console.log('API Endpoint Test Results:', results);
    
    // Count successes and errors
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    console.log(`Test Summary: ${successCount} working, ${errorCount} errors, ${warningCount} warnings`);
    
    return results;
  },
  
  /**
   * Run diagnostics and display results in a user-friendly way
   */
  async runAndDisplay() {
    console.log('Starting API diagnostics...');
    
    const results = await this.testAllEndpoints();
    
    // Create a display element to show results
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.width = '500px';
    container.style.maxHeight = '80vh';
    container.style.overflow = 'auto';
    container.style.zIndex = '9999';
    container.style.backgroundColor = 'white';
    container.style.padding = '15px';
    container.style.borderRadius = '5px';
    container.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Add header
    const header = document.createElement('div');
    header.innerHTML = '<h2 style="margin-top:0;">API Diagnostics Results</h2>';
    container.appendChild(header);
    
    // Add summary
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    const summary = document.createElement('div');
    summary.innerHTML = `
      <div style="margin-bottom:15px;">
        <span style="color:green;">${successCount} working</span> | 
        <span style="color:red;">${errorCount} errors</span> | 
        <span style="color:orange;">${warningCount} warnings</span>
      </div>
    `;
    container.appendChild(summary);
    
    // Add results
    results.forEach(result => {
      const resultEl = document.createElement('div');
      resultEl.style.marginBottom = '10px';
      resultEl.style.padding = '10px';
      resultEl.style.border = '1px solid #ddd';
      resultEl.style.borderRadius = '4px';
      resultEl.style.backgroundColor = 
        result.status === 'success' ? '#f0fff0' : 
        result.status === 'error' ? '#fff0f0' : '#ffffd0';
      
      resultEl.innerHTML = `
        <div style="font-weight:bold;">${result.name}</div>
        <div style="font-size:12px;color:#666;margin-bottom:5px;">${result.url}</div>
        <div style="margin-bottom:5px;">
          Status: <span style="
            color:${result.status === 'success' ? 'green' : result.status === 'error' ? 'red' : 'orange'}
          ">${result.status} ${result.statusCode ? `(${result.statusCode})` : ''}</span>
        </div>
        <div style="margin-bottom:5px;">Response Type: ${result.responseType || 'Unknown'}</div>
        <div>${result.info}</div>
        ${result.data ? `<div style="margin-top:5px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          Data: ${typeof result.data === 'object' ? JSON.stringify(result.data).substring(0, 100) + '...' : result.data}
        </div>` : ''}
      `;
      container.appendChild(resultEl);
    });
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.marginTop = '10px';
    closeBtn.style.padding = '8px 15px';
    closeBtn.style.backgroundColor = '#f0f0f0';
    closeBtn.style.border = '1px solid #ddd';
    closeBtn.style.borderRadius = '4px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => container.remove();
    container.appendChild(closeBtn);
    
    // Add to page
    document.body.appendChild(container);
    
    console.log('API diagnostics complete. Results displayed.');
    return results;
  }
};

export default ApiDiagnostics;