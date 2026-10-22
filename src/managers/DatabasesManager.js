class DatabasesManager {
  constructor(client) {
    this.client = client;
  }

  /**
   * Lista todos os bancos de dados criados pelo usuário
   */
  async list() {
    const data = await this.client.request("GET", "databases/list");
    return data.response || data;
  }

  /**
   * Cria um novo banco de dados MySQL
   */
  async create() {
    const data = await this.client.request("POST", "databases/create");
    return data.response || data;
  }

  /**
   * Rotaciona/redefine a senha de um banco de dados
   */
  async rotatePassword(dbId) {
    const data = await this.client.request("POST", `databases/${dbId}/rotate`);
    return data.response || data;
  }

  /**
   * Deleta um banco de dados
   */
  async delete(dbId) {
    const data = await this.client.request("DELETE", `databases/${dbId}`);
    return data.response || data;
  }
}

module.exports = { DatabasesManager };
