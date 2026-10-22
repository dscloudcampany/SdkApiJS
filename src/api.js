const axios = require("axios");
const fs = require('fs');
const FormData = require('form-data');

class DsCloudAPIError extends Error {
    constructor(message, status, originalError) {
        super(message);
        this.name = 'DsCloudAPIError';
        this.status = status;
        this.originalError = originalError;
        this.logError();
    }

    logError() {
        const logMessage = `
        [${new Date().toISOString()}] ERROR: ${this.message}
        Status: ${this.status}
        Stack: ${this.stack}
        ------------------------------------\n`;
        fs.appendFileSync('errors.log', logMessage, 'utf8');
    }
}

class DsCloudAPIKEY {
    constructor(apiKey, options = {}) {
        if (!apiKey) {
            throw new DsCloudAPIError("API key is required.");
        }

        this.apiKey = apiKey;
        this.baseURL = options.baseURL || "https://api.dscloud.pt/v1/";
        this.timeout = options.timeout || 30000;

        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        this.client.interceptors.response.use(
            response => response.data,
            error => this.handleError(error)
        );
    }

    async handleError(error) {
        const status = error.response?.status;
        const message = error.response?.data?.error || error.message;
        const code = error.response?.data?.code;
    
        const errorMap = {
            401: "Unauthorized. Check your API key.",
            404: "Resource not found.",
            429: "Too many requests. Please try again later.",
            RAM_LIMIT_EXCEEDED: "The requested memory exceeds your RAM limit.",
        };
    
        const errorMessage = status >= 500 
            ? "Server error. Please try again later." 
            : errorMap[code] || errorMap[status] || message || "An unknown error occurred.";
    
        const dsError = new DsCloudAPIError(errorMessage, status, error);
        console.error(dsError.message);
        return Promise.reject(dsError);
    }    

    async getUser() {
        const data = await this.request("GET", "users/me");
        if (!data?.response?.user) {
            throw new DsCloudAPIError("User data not found in response");
        }
        return data.response;
    }

    async getApplications() {
        const data = await this.request("GET", "users/me");
        return data?.response?.applications || [];
    }

    async getApplication(appId) {
        if (!appId) {
            throw new DsCloudAPIError("Application ID is required.");
        }
        const data = await this.request("GET", `apps/${appId}/status`);
        return new Application(appId, data?.response, this.client);
    }

    async request(method, path, data = null) {
        try {
            return await this.client.request({
                method,
                url: path,
                data: method !== 'GET' ? data : undefined,
                params: method === 'GET' ? data : undefined
            });
        } catch (error) {
            throw this.handleError(error);
        }
    }
}

class Application {
    constructor(appId, appData, client) {
        if (!appId || !client) {
            throw new DsCloudAPIError("Application ID and client are required.");
        }

        this.appId = appId;
        this.data = appData || {};
        this.client = client;

        this.files = {
            create: this.createFile.bind(this),
            delete: this.deleteFile.bind(this),
            list: this.listFiles.bind(this)
        };
    }

    getStatus() {
        return {
            usage: {
                cpu: `${this.data.cpu || 0}`,
                ram: `${this.data.ram || 0}`,
                network: this.data.network || { in: "0B", out: "0B" },
                storage: this.data.storage
            },
            running: Boolean(this.data.running),
            status: this.data.status || "unknown",
        };
    }

    async #controlAction(action) {
        try {
            const response = await this.client.post(`apps/${this.appId}/${action}`);
            return response?.status === "success";
        } catch (error) {
            console.error(`Error during application ${action}:`, error.message);
            return false;
        }
    }

    async start() {
        return this.#controlAction('start');
    }

    async stop() {
        return this.#controlAction('stop');
    }

    async restart() {
        return this.#controlAction('restart');
    }

    async getLogs() {
        try {
            const response = await this.client.get(`apps/${this.appId}/logs`);
            const logs = response?.response?.logs;

            if (typeof logs !== 'string') {
                throw new DsCloudAPIError("Invalid log format received");
            }

            return logs;
        } catch (error) {
            if (!error || error.originalError.response.data.response.logs === "No log ready") {
                return "No logs available for this application."
            } else {
                throw new DsCloudAPIError("Failed to fetch logs", error.response?.status, error);
            }
        }
    }

    async listFiles(path = '') {
        try {
            const response = await this.client.get(`apps/${this.appId}/files`, {
                params: { path }
            });
            return response?.response || [];
        } catch (error) {
            throw new DsCloudAPIError("Failed to list files", error.response?.status, error);
        }
    }

    async readFile(path) {
        if (!path) {
            throw new DsCloudAPIError("File path is required.");
        }

        try {
            const response = await this.client.get(`apps/${this.appId}/files/content`, {
                params: { path }
            });

            const fileContent = response?.response;

            if (!fileContent) {
                throw new DsCloudAPIError("Failed to read file content");
            }

            return Buffer.from(fileContent, 'base64');
        } catch (error) {
            throw new DsCloudAPIError("Failed to read file content", error.response?.status, error);
        }
    }

    async createFile(content, path) {
        try {
            let fileContent = content;

            if (typeof content === 'string' && !Buffer.isBuffer(content)) {
                const fs = require('fs');
                if (fs.existsSync(content)) {
                    fileContent = fs.readFileSync(content, 'utf8');
                } else {
                    fileContent = content;
                }
            } else if (Buffer.isBuffer(content)) {
                fileContent = content.toString('utf8');
            }

            const response = await this.client.put(`apps/${this.appId}/files`, {
                content: fileContent,
                path: path
            });

            if (response?.status === 'success') {
                return true;
            } else {
                throw new DsCloudAPIError("Failed to create or modify the file.");
            }
        } catch (error) {
            console.error("Error creating or modifying file:", error);
            return false;
        }
    }

    async deleteFile(path) {
        try {
            const response = await this.client.delete(`apps/${this.appId}/files`, {
                headers: { 'Content-Type': 'application/json' },
                data: { path }
            });

            if (response?.status === 'success') {
                return true;
            } else {
                throw new DsCloudAPIError("Failed to delete the file.");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
            return false;
        }
    }

    async uploadApplication(filePath) {
        if (!filePath) {
            throw new DsCloudAPIError("File path is required for upload.");
        }
    
        try {
            const formData = new FormData();
            formData.append("file", fs.createReadStream(filePath));
    
            const response = await this.client.post("apps", formData, {
                headers: { ...formData.getHeaders() },
            });
            // console.log(response.response)
    
            if (response?.status === "success") {
                console.log("Upload successful:", response.response);
                return response.response;
            } else {
                throw new DsCloudAPIError(`Failed to upload application. API Response: ${JSON.stringify(response)}`);
            }
        } catch (error) {
            if (error.response?.data?.code === "RAM_LIMIT_EXCEEDED") {
                throw new DsCloudAPIError("FEW_MEMOR: The requested memory exceeds your RAM limit.");
            }

            throw new DsCloudAPIError(`Error during application upload: ${error.response?.data?.message || error.message}`);
        }
    }
    
    async commit(filePath) {
        if (!filePath) {
            throw new DsCloudAPIError("File path is required for commit.");
        }

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            const response = await this.client.post(`apps/${this.appId}/commit`, formData, {
                headers: { ...formData.getHeaders() },
            });

            if (response?.status === 'success') {
                return true;
            } else {
                throw new DsCloudAPIError("Failed to commit application.");
            }
        } catch (error) {
            console.error("Error during application commit:", error);
            throw new DsCloudAPIError("Error during application commit.", error);
        }
    }

    async delete() {
        try {
            const response = await this.client.delete(`apps/${this.appId}`);
            if (response?.status === 'success') {
                return true;
            } else {
                throw new DsCloudAPIError("Failed to delete application.");
            }
        } catch (error) {
            console.error("Error deleting application:", error);
            return false;
        }
    }
}

module.exports = { DsCloudAPIKEY, DsCloudAPIError };
