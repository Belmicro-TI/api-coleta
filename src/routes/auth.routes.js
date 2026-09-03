const { Router } = require('express');
const { getToken } = require('../services/keycloak.service');

const router = Router();

router.get('/token', async (req, res) => {
  const result = await getToken();
  return res.status(result.status).json(result.body);
});

module.exports = router;
