const axios = require('axios');

class FormbarClient {
    constructor(apiKey, baseUrl = null, logger = console) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl || 'http://formbeta.yorktechapps.com/api';
        this.logger = logger;
        
        // Set up default headers for all requests
        this.defaultHeaders = {
            'API': this.apiKey,
            'Content-Type': 'application/json'
        };

        // Validate that we have an API key
        if (!this.apiKey || this.apiKey === 'get ur own api key and put it here') {
            this.logger.warn('⚠️ FormbarClient: No valid API key provided');
        }
    }

    // Test the API connection
    async testConnection() {
        try {
            const user = await this.getCurrentUser();
            this.logger.info('✅ Formbar API connection successful');
            return { 
                success: true, 
                connected: true, 
                user: user,
                message: 'Successfully connected to Formbar API'
            };
        } catch (error) {
            this.logger.error('❌ Formbar API connection failed:', error.response?.data || error.message);
            return { 
                success: false, 
                connected: false, 
                error: error.response?.data || error.message,
                message: 'Failed to connect to Formbar API'
            };
        }
    }

    // Get current user info (based on API key)
    async getCurrentUser() {
        try {
            const response = await axios.get(`${this.baseUrl}/me`, {
                headers: this.defaultHeaders
            });
            
            this.logger.info('📊 Retrieved current user from Formbar API');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error('❌ Failed to get current user from Formbar:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get user by ID
    async getUserById(userId) {
        try {
            const response = await axios.get(`${this.baseUrl}/user/${userId}`, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`📊 Retrieved user ${userId} from Formbar`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to get user ${userId} from Formbar:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Get class information
    async getClassInfo(classId) {
        try {
            const response = await axios.get(`${this.baseUrl}/class/${classId}`, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`🏫 Retrieved class ${classId} info from Formbar`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to get class ${classId} from Formbar:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Get class students
    async getClassStudents(classId) {
        try {
            const response = await axios.get(`${this.baseUrl}/class/${classId}/students`, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`👥 Retrieved students for class ${classId} from Formbar`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to get students for class ${classId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Create a poll in a class
    async createPoll(classId, pollData) {
        try {
            const response = await axios.post(`${this.baseUrl}/class/${classId}/polls/create`, pollData, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`📊 Created poll in class ${classId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to create poll in class ${classId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    // End a poll
    async endPoll(classId) {
        try {
            const response = await axios.post(`${this.baseUrl}/class/${classId}/polls/end`, {}, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`📊 Ended poll in class ${classId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to end poll in class ${classId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Get poll results
    async getPollResults(classId) {
        try {
            const response = await axios.get(`${this.baseUrl}/class/${classId}/polls`, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`📊 Retrieved poll results for class ${classId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to get poll results for class ${classId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Award digipogs
    async awardDigipogs(fromUserId, toUserId, amount) {
        try {
            const response = await axios.post(`${this.baseUrl}/digipogs/award`, {
                from: fromUserId,
                to: toUserId,
                amount: amount
            }, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`💰 Awarded ${amount} digipogs from ${fromUserId} to ${toUserId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to award digipogs:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Transfer digipogs between users
    async transferDigipogs(fromUserId, toUserId, amount, pin, reason = '') {
        try {
            const response = await axios.post(`${this.baseUrl}/digipogs/transfer`, {
                from: fromUserId,
                to: toUserId,
                amount: amount,
                pin: pin,
                reason: reason
            }, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`💸 Transferred ${amount} digipogs from ${fromUserId} to ${toUserId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to transfer digipogs:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Start a class session
    async startClass(classId) {
        try {
            const response = await axios.post(`${this.baseUrl}/class/${classId}/start`, {}, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`🏫 Started class session ${classId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to start class ${classId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    // End a class session
    async endClass(classId) {
        try {
            const response = await axios.post(`${this.baseUrl}/class/${classId}/end`, {}, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`🏫 Ended class session ${classId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to end class ${classId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Get room/class links
    async getClassLinks(classId) {
        try {
            const response = await axios.get(`${this.baseUrl}/room/${classId}/links`, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`🔗 Retrieved links for class ${classId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to get class links for ${classId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Add a class link
    async addClassLink(classId, name, url) {
        try {
            const response = await axios.post(`${this.baseUrl}/room/${classId}/links/add`, {
                name: name,
                url: url
            }, {
                headers: this.defaultHeaders
            });
            
            this.logger.info(`🔗 Added link "${name}" to class ${classId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`❌ Failed to add link to class ${classId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Generic API request method
    async makeRequest(method, endpoint, data = null) {
        try {
            const config = {
                method: method.toLowerCase(),
                url: `${this.baseUrl}${endpoint}`,
                headers: this.defaultHeaders
            };

            if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
                config.data = data;
            }

            const response = await axios(config);
            
            this.logger.info(`🌐 API request successful: ${method} ${endpoint}`);
            return {
                success: true,
                data: response.data,
                status: response.status
            };
        } catch (error) {
            this.logger.error(`❌ API request failed: ${method} ${endpoint}`, error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = FormbarClient;