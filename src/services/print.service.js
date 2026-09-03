const axios = require('axios');
const { handleAxiosError } = require('../utils/httpError');

const api = axios.create({ timeout: 30000 });

async function sendPrint(address, zpl, port = 9100) {
  const bridgeUrl = process.env.PRINT_BRIDGE_URL;
  const bridgeToken = process.env.PRINT_BRIDGE_TOKEN;

  if (!bridgeUrl) {
    return {
      status: 503,
      body: { success: false, error: 'Serviço de impressão não configurado' },
    };
  }

  try {
    await api.post(
      `${bridgeUrl}/print`,
      { address, port, zpl },
      {
        headers: {
          Authorization: `Bearer ${bridgeToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      status: 200,
      body: { status: 'ok', message: `Etiqueta enviada para ${address}` },
    };
  } catch (error) {
    console.error('Erro ao enviar etiqueta para o Print Bridge');
    return handleAxiosError(error, 'Erro ao enviar etiqueta para impressora');
  }
}

module.exports = { sendPrint };
