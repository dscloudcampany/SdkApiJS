const fs = require("fs");
const FormData = require("form-data");
const { Application } = require("../structures/Application");
const { DsCloudAPIError } = require("../errors");

class AppsManager {
  constructor(client) {
    this.client = client;
  }

  /**
   * Lista todas as aplicações do usuário
   */
  async list() {
    const data = await this.client.request("GET", "users/me");
    const appsList = data.response?.applications || data.applications || [];
    return appsList.map((appData) => new Application(this.client, appData));
  }

  /**
   * Obtém os detalhes de uma aplicação específica pelo ID
   */
  async get(appId) {
    if (!appId) {
      throw new DsCloudAPIError("ID da aplicação é obrigatório.", "MISSING_APP_ID", 400);
    }
    const data = await this.client.request("GET", `apps/${appId}`);
    const appData = data.response || data;
    return new Application(this.client, appData);
  }

  /**
   * Obtém o status de todas as aplicações ou de uma aplicação específica
   */
  async status(appId = null) {
    if (appId) {
      const data = await this.client.request("GET", `apps/${appId}/status`);
      return data.response || data;
    }
    const data = await this.client.request("GET", "apps/status");
    return data.response || data;
  }

  /**
   * Faz deploy de uma nova aplicação enviando arquivo .zip com dscloud.config
   */
  async upload(filePathOrBuffer, fileName = "app.zip") {
    const form = new FormData();
    if (typeof filePathOrBuffer === "string") {
      if (!fs.existsSync(filePathOrBuffer)) {
        throw new DsCloudAPIError(`Arquivo não encontrado: ${filePathOrBuffer}`, "FILE_NOT_FOUND", 400);
      }
      form.append("file", fs.createReadStream(filePathOrBuffer), fileName);
    } else if (Buffer.isBuffer(filePathOrBuffer)) {
      form.append("file", filePathOrBuffer, fileName);
    } else {
      throw new DsCloudAPIError("Parâmetro deve ser caminho de arquivo (string) ou Buffer", "INVALID_FILE", 400);
    }

    const data = await this.client.request("POST", "apps", form, {
      headers: form.getHeaders(),
      timeout: 120000
    });

    const appData = data.response || data;
    return new Application(this.client, appData);
  }
}

module.exports = { AppsManager };
