class UsersManager {
  constructor(client) {
    this.client = client;
  }

  /**
   * Obtém informações da conta do usuário autenticado e suas aplicações
   */
  async me() {
    const data = await this.client.request("GET", "users/me");
    return data.response || data;
  }
}

module.exports = { UsersManager };
