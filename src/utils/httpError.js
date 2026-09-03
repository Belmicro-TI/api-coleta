function handleAxiosError(error, defaultMessage = 'Erro na requisição externa') {
  if (error.response) {
    return {
      status: error.response.status,
      body: {
        success: false,
        error: defaultMessage,
        details: error.response.data,
      },
    };
  }

  if (error.code === 'ECONNABORTED') {
    return {
      status: 504,
      body: {
        success: false,
        error: 'Timeout: o serviço externo demorou demais para responder',
      },
    };
  }

  return {
    status: 503,
    body: {
      success: false,
      error: 'Serviço externo indisponível',
    },
  };
}

module.exports = { handleAxiosError };
