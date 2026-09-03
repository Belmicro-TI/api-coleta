const axios = require('axios');
const { handleAxiosError } = require('../utils/httpError');

const api = axios.create({ timeout: 30000 });

const DEFAULT_TOKEN_URL =
  'https://idp.grupobelmicro.com.br/realms/usuarios-internos/protocol/openid-connect/token';

let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt) {
    return { status: 200, body: { access_token: cachedToken, type: 'Bearer' } };
  }

  const url = process.env.KEYCLOAK_TOKEN_URL || DEFAULT_TOKEN_URL;

  const params = new URLSearchParams();
  params.append('client_id', process.env.KEYCLOAK_CLIENT_ID);
  params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET);
  params.append('grant_type', 'client_credentials');

  try {
    const response = await api.post(url, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, expires_in } = response.data;

    cachedToken = access_token;
    tokenExpiresAt = now + (expires_in - 60) * 1000;

    console.log('Token Keycloak obtido');
    return { status: 200, body: { access_token, type: 'Bearer' } };
  } catch (error) {
    console.error('Erro ao obter token Keycloak');
    cachedToken = null;
    tokenExpiresAt = 0;
    return handleAxiosError(error, 'Erro ao obter token do Keycloak');
  }
}

module.exports = { getToken };
