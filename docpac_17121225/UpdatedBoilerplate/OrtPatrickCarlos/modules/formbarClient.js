const logger = require('./logger');
const FORMBAR_CLIENT_SECRET = process.env.FORMBAR_CLIENT_SECRET;
const FORMBAR_REDIRECT_URI = process.env.FORMBAR_REDIRECT_URI;


class FormbarClient {
    constructor(options = {}) {
        this.baseUrl = process.env.FORMBAR_REDIRECT_URI || 'https://api.formbar.com';
        this.clientSecret = process.env.FORMBAR_CLIENT_SECRET;
        
        if (!this.clientSecret) {
            throw new Error('Formbar client secret is required');
        }
    }
    
    // Private method for all requests
    async _request(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            
            const defaultHeaders = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.clientSecret}`,
            };
            
            const fetchOptions = {
                method: 'GET',
                headers: { ...defaultHeaders, ...options.headers },
                ...options
            };
            
            logger.info(`Making Formbar API request: ${fetchOptions.method} ${url}`);
            
            const response = await fetch(url, fetchOptions);
            
            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`Formbar API error: ${response.status} - ${errorText}`);
                throw new Error(`Formbar API request failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            logger.info(`Formbar API request successful: ${endpoint}`);
            return data;
            
        } catch (error) {
            logger.error(`Formbar API request failed: ${error.message}`);
            throw error;
        }
    }

    async authenticateUser(authData) {
        return await this._request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(authData)
        });
    }
    
    // Send generic request (used by formbarAuth.js)
    async sendRequest(endpoint, options) {
        return await this._request(endpoint, options);
    }
    
    // Exchange token (used by formbarAuth.js)
    async exchangeToken(tokenData) {
        return await this._request('/auth/token', {
            method: 'POST',
            body: JSON.stringify(tokenData)
        });
    }
    
    // Existing methods
    async getUser(userId) { 
        return await this._request(`/users/${userId}`); 
    }
    
    async getClass(classId) { 
        return await this._request(`/classes/${classId}`); 
    }
}

// Export a default instance AND the class
const defaultClient = new FormbarClient();

module.exports = {
    FormbarClient,
    default: defaultClient,
    // Convenience exports
    getUser: (userId) => defaultClient.getUser(userId),
    getClass: (classId) => defaultClient.getClass(classId),
    authenticateUser: (authData) => defaultClient.authenticateUser(authData),
    sendRequest: (endpoint, options) => defaultClient.sendRequest(endpoint, options),
    exchangeToken: (tokenData) => defaultClient.exchangeToken(tokenData)
};
