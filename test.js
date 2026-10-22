const { DsCloudAPI } = require('./src');

async function testarSDK() {
    const apiKey = process.env.DSCLOUD_API_KEY || "YOUR_API_KEY_HERE";
    const api = new DsCloudAPI(apiKey);

    try {
        console.log("SDK inicializado com sucesso.");
        // Exemplo:
        // const account = await api.users.me();
        // console.log("Usuário conectado:", account.user.name);
    } catch (error) {
        console.error("Erro ao testar o SDK:", {
            message: error.message,
            code: error.code,
            status: error.status
        });
    }
}

testarSDK();
