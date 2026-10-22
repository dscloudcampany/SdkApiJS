const fs = require("fs");
const FormData = require("form-data");
const { DsCloudAPIError } = require("../errors");

class Application {
  constructor(client, data) {
    this.client = client;
    this.id = data.id || data.identifier;
    this.name = data.name || null;
    this.desc = data.desc || data.description || null;
    this.ram = data.ram || 0;
    this.lang = data.lang || data.language || null;
    this.domain = data.domain || null;
    this.custom = data.custom || null;
    this.cluster = data.cluster || null;
    this.raw = data;

    // Sub-gerenciador de arquivos da aplicação
    this.files = {
      list: (dir = "") => this.listFiles(dir),
      read: (filePath) => this.readFile(filePath),
      write: (filePath, content) => this.writeFile(filePath, content),
      rename: (from, to) => this.renameFile(from, to),
      delete: (filePath) => this.deleteFile(filePath)
    };

    // Sub-gerenciador de backups
    this.backups = {
      list: () => this.listBackups(),
      create: () => this.createBackup()
    };
  }

  /**
   * Obtém status de recursos em tempo real (CPU, RAM, disco, uptime, rede)
   */
  async status() {
    const data = await this.client.request("GET", `apps/${this.id}/status`);
    return data.response || data;
  }

  /**
   * Obtém os logs recentes da aplicação
   */
  async logs() {
    const data = await this.client.request("GET", `apps/${this.id}/logs`);
    return data.response?.logs || data.logs || "";
  }

  /**
   * Inicia a aplicação
   */
  async start() {
    return this.client.request("POST", `apps/${this.id}/start`);
  }

  /**
   * Reinicia a aplicação
   */
  async restart() {
    return this.client.request("POST", `apps/${this.id}/restart`);
  }

  /**
   * Para a aplicação
   */
  async stop() {
    return this.client.request("POST", `apps/${this.id}/stop`);
  }

  /**
   * Envia novo código .zip para a aplicação
   */
  async commit(filePathOrBuffer, fileName = "commit.zip") {
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

    return this.client.request("POST", `apps/${this.id}/commit`, form, {
      headers: form.getHeaders()
    });
  }

  /**
   * Lista backups da aplicação
   */
  async listBackups() {
    const data = await this.client.request("GET", `apps/${this.id}/backups`);
    return data.response || data;
  }

  /**
   * Cria novo backup da aplicação
   */
  async createBackup() {
    const data = await this.client.request("POST", `apps/${this.id}/backups`);
    return data.response || data;
  }

  /**
   * Lista arquivos de um diretório
   */
  async listFiles(dir = "/") {
    const data = await this.client.request("GET", `apps/${this.id}/files`, null, {
      params: { path: dir }
    });
    return data.response || data;
  }

  /**
   * Lê o conteúdo de um arquivo
   */
  async readFile(filePath) {
    const data = await this.client.request("GET", `apps/${this.id}/files/content`, null, {
      params: { path: filePath }
    });
    const bufferData = data.response?.data;
    if (Array.isArray(bufferData)) {
      return Buffer.from(bufferData);
    }
    return data.response || data;
  }

  /**
   * Cria ou sobrescreve um arquivo
   */
  async writeFile(filePath, content) {
    let textContent = content;
    if (Buffer.isBuffer(content)) {
      textContent = content.toString("utf8");
    } else if (typeof content === "string" && fs.existsSync(content)) {
      textContent = fs.readFileSync(content, "utf8");
    }

    return this.client.request("PUT", `apps/${this.id}/files`, {
      path: filePath,
      content: textContent
    });
  }

  /**
   * Renomeia ou move um arquivo
   */
  async renameFile(sourcePath, destPath) {
    return this.client.request("PATCH", `apps/${this.id}/files`, {
      path: sourcePath,
      to: destPath
    });
  }

  /**
   * Deleta um arquivo
   */
  async deleteFile(filePath) {
    return this.client.request("DELETE", `apps/${this.id}/files`, {
      path: filePath
    });
  }

  /**
   * Deleta a aplicação inteira
   */
  async delete() {
    return this.client.request("DELETE", `apps/${this.id}`);
  }

  // Aliases retrocompatíveis com v1 do SDK
  getStatus() {
    return this.status();
  }
  getLogs() {
    return this.logs();
  }
  createFile(content, path) {
    return this.writeFile(path, content);
  }
}

module.exports = { Application };
