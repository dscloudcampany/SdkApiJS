const axios = require("axios");
const { DsCloudAPIError } = require("./errors");
const { UsersManager } = require("./managers/UsersManager");
const { AppsManager } = require("./managers/AppsManager");
const { DatabasesManager } = require("./managers/DatabasesManager");

class DsCloudAPI {
  /**
   * Inicializa o cliente da API DSCloud
   * @param {string} apiKey - Chave de API do usuário
   * @param {Object} [options] - Opções de configuração
   * @param {string} [options.baseURL="https://api.dscloud.pt/v3/"] - URL base da API
   * @param {number} [options.timeout=30000] - Timeout padrão das requisições em ms
   */
  constructor(apiKey, options = {}) {
    if (!apiKey || typeof apiKey !== "string") {
      throw new DsCloudAPIError("API key é obrigatória.", "MISSING_API_KEY", 400);
    }

    this.apiKey = apiKey.trim();
    let base = options.baseURL || "https://api.dscloud.pt/v3/";
    if (!base.endsWith("/")) base += "/";
    this.baseURL = base;
    this.timeout = options.timeout || 30000;

    this.http = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        Authorization: this.apiKey.startsWith("Bearer ") ? this.apiKey : `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });

    // Inicialização dos gerenciadores modulares (arquitetura moderna DSCloud)
    this.users = new UsersManager(this);
    this.apps = new AppsManager(this);
    this.databases = new DatabasesManager(this);
  }

  /**
   * Executa requisição HTTP autenticada com tratamento uniforme de erros
   */
  async request(method, path, data = null, extraConfig = {}) {
    try {
      const response = await this.http.request({
        method,
        url: path,
        data: method !== "GET" ? data : undefined,
        params: method === "GET" ? (extraConfig.params || data) : extraConfig.params,
        ...extraConfig
      });
      return response.data;
    } catch (err) {
      const status = err.response?.status || 500;
      const resData = err.response?.data;
      const message =
        resData?.message ||
        resData?.error ||
        err.message ||
        "Erro desconhecido na API DSCloud";
      const code = resData?.code || (status === 401 ? "UNAUTHORIZED" : status === 404 ? "NOT_FOUND" : "REQUEST_FAILED");

      throw new DsCloudAPIError(message, code, status, resData);
    }
  }

  // =========================================================================
  // MÉTODOS DE COMPATIBILIDADE RETROATIVA (v1)
  // =========================================================================

  async getUser() {
    return this.users.me();
  }

  async getApplications() {
    return this.apps.list();
  }

  async getApplication(appId) {
    return this.apps.get(appId);
  }

  async uploadApplication(filePath) {
    return this.apps.upload(filePath);
  }
}

// Alias para compatibilidade total com código legado
const DsCloudAPIKEY = DsCloudAPI;

module.exports = {
  DsCloudAPI,
  DsCloudAPIKEY
};
