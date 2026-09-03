const axios = require('axios');
const { handleAxiosError } = require('../utils/httpError');
const { getBrasiliaDateTime } = require('../utils/date');
const { normalizeBearerToken } = require('../utils/bearer');

const api = axios.create({ timeout: 30000 });

async function login() {
  const url =
    'https://skwlb.grupobelmicro.com.br/mge/service.sbr?serviceName=MobileLoginSP.login&outputType=json';

  const body = {
    serviceName: 'MobileLoginSP.login',
    requestBody: {
      NOMUSU: { $: process.env.SANKHYA_LOGIN_USER },
      INTERNO: { $: process.env.SANKHYA_LOGIN_PASSWORD },
      KEEPCONNECTED: { $: 'S' },
    },
  };

  try {
    const response = await api.post(url, body);
    console.log('Login Sankhya realizado com sucesso');
    return { status: 200, body: response.data };
  } catch (error) {
    console.error('Erro ao realizar login no Sankhya');
    return handleAxiosError(error, 'Erro ao realizar login no Sankhya');
  }
}

async function getApiKey() {
  const url = 'https://api.sankhya.com.br/authenticate';

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', process.env.SANKHYA_CLIENT_ID);
  params.append('client_secret', process.env.SANKHYA_CLIENT_SECRET);

  try {
    const response = await api.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/x-www-form-urlencoded',
        'X-Token': process.env.SANKHYA_X_TOKEN,
      },
    });
    console.log('Token Sankhya obtido');
    return { status: 200, body: response.data };
  } catch (error) {
    console.error('Erro ao obter token Sankhya');
    return handleAxiosError(error, 'Erro ao obter token Sankhya');
  }
}

function injectDhInclusao(payload) {
  try {
    const formatado = payload?.requestBody?.param?.formulario?.formatado;
    if (!Array.isArray(formatado)) return;

    const entity = formatado.find((e) => e.entityName === 'AD_ZENCOLETA');
    if (!entity) return;

    const record = entity?.records?.[0]?.record;
    if (!Array.isArray(record)) return;

    const dataHoraAtual = getBrasiliaDateTime();
    const index = record.findIndex((f) => f.name === 'DHINCLUSAO');

    if (index >= 0) {
      record[index].value = dataHoraAtual;
    } else {
      record.push({ name: 'DHINCLUSAO', value: dataHoraAtual });
    }
  } catch (e) {
    console.error('Aviso: não foi possível injetar DHINCLUSAO -', e.message);
  }
}

async function sendColeta(payload, token) {
  const url =
    'https://api.sankhya.com.br/gateway/v1/workflow/service.sbr?serviceName=ListaTarefaSP.startProcess&counter=65&application=ListaTarefa&outputType=json';

  injectDhInclusao(payload);

  try {
    const response = await api.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: normalizeBearerToken(token),
      },
    });
    console.log('Coleta enviada com sucesso');
    return { status: 200, body: response.data };
  } catch (error) {
    console.error('Erro ao enviar coleta ao Sankhya');
    return handleAxiosError(error, 'Erro ao enviar coleta ao Sankhya');
  }
}

module.exports = { login, getApiKey, sendColeta };
