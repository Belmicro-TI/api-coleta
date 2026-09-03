const { Router } = require('express');
const { login, getApiKey, sendColeta } = require('../services/sankhya.service');

const router = Router();

router.post('/login', async (req, res) => {
  const result = await login();
  return res.status(result.status).json(result.body);
});

router.post('/apikey', async (req, res) => {
  const result = await getApiKey();
  return res.status(result.status).json(result.body);
});

router.post('/coleta', async (req, res) => {
  const { payload, token } = req.body;

  if (!payload || !token) {
    return res.status(400).json({
      success: false,
      error: 'Os campos "payload" e "token" são obrigatórios',
    });
  }

  const result = await sendColeta(payload, token);
  return res.status(result.status).json(result.body);
});

module.exports = router;
